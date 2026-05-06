const { onRequest } = require("firebase-functions/v2/https");
const { google } = require("googleapis");
const cors = require("cors")({ origin: true });

const SHEET_ID = "1mfRlr9EaR-XVMEf3W0LaJEEUQ9uS9llLsWTr0jz88ng";
const COST_PER_GRAM = 0.013;

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
}

// GET /getOrders - returns all orders, items, filament and planner state
exports.getOrders = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    try {
      const sheets = await getSheets();
      const [ordersRes, itemsRes, filamentRes, plannerRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Orders!A:L" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Order Items!A:H" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Filament Inventory!A:B" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Planner State!A:C" }).catch(() => ({ data: { values: [] } })),
      ]);

      const ordersRows = ordersRes.data.values || [];
      const itemsRows = itemsRes.data.values || [];
      const filamentRows = filamentRes.data.values || [];
      const plannerRows = plannerRes.data.values || [];

      const orders = ordersRows.slice(1).map((r, i) => ({
        row: i + 2,
        id: r[0] || "",
        customer: r[1] || "",
        design: r[2] || "",
        price: r[3] || "",
        status: r[4] || "Pending",
        payment: r[5] || "",
        notes: r[6] || "",
        source: r[7] || "",
        date: r[8] || "",
        isShiny: r[9] || "false",
        isMystery: r[10] || "false",
        rush: r[11] || "false",
      })).filter(o => o.id);

      const items = itemsRows.slice(1).map((r, i) => ({
        row: i + 2,
        orderRef: r[0] || "",
        slug: r[1] || "",
        name: r[2] || "",
        price: parseFloat(r[3]) || 0,
        status: r[4] || "Pending",
        shiny: r[5] || "false",
        cost: parseFloat(r[6]) || 0,
        shinyRequest: r[7] || "",
      })).filter(it => it.orderRef);

      const filament = filamentRows.slice(1).map((r, i) => ({
        row: i + 2,
        colorName: r[0] || "",
        grams: parseFloat(r[1]) || 0,
      })).filter(f => f.colorName);

      // Build planner state object: { "designId_plateIndex": true/false }
      const plannerState = {};
      plannerRows.slice(1).forEach(r => {
        if (r[0] && r[1] !== undefined) {
          plannerState[r[0] + "_" + r[1]] = (r[2] || "").toLowerCase() === "true";
        }
      });

      res.status(200).json({ orders, items, filament, plannerState });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /updateItem - update a design item's status/shiny
exports.updateItem = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { row, status, shiny } = req.body;
      if (!row) return res.status(400).json({ error: "Missing row" });
      const sheets = await getSheets();
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: "Order Items!E" + row + ":F" + row,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[status, shiny]] },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /deleteItem - delete a design from an order
exports.deleteItem = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { row } = req.body;
      if (!row) return res.status(400).json({ error: "Missing row" });
      const sheets = await getSheets();
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
      const sheet = meta.data.sheets.find(s => s.properties.title === "Order Items");
      if (!sheet) return res.status(400).json({ error: "Sheet not found" });
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: "ROWS",
                startIndex: row - 1,
                endIndex: row,
              }
            }
          }]
        }
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /addItem - add a design to an existing order
exports.addItem = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { orderRef, slug, name, price } = req.body;
      if (!orderRef || !name) return res.status(400).json({ error: "Missing fields" });
      const cost = Math.round(price * COST_PER_GRAM * 100) / 100;
      const sheets = await getSheets();
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Order Items!A:H",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [[orderRef, slug || "", name, price, "Pending", "false", cost, ""]] },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /createOrder - create a manual order
exports.createOrder = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { id, customer, payment, notes, source, items } = req.body;
      if (!id || !customer) return res.status(400).json({ error: "Missing fields" });
      const sheets = await getSheets();
      const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" });
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Orders!A:L",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [[id, customer, "", "", "Pending", payment || "Cash", notes || "", source || "Manual", date, "false", "false", "false"]] },
      });
      if (items && items.length) {
        const rows = items.map(it => {
          const cost = Math.round(it.price * COST_PER_GRAM * 100) / 100;
          return [id, it.slug || "", it.name, it.price, "Pending", "false", cost, ""];
        });
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "Order Items!A:H",
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: rows },
        });
      }
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /updateFilament - update filament grams
exports.updateFilament = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { row, grams } = req.body;
      if (!row) return res.status(400).json({ error: "Missing row" });
      const sheets = await getSheets();
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: "Filament Inventory!B" + row,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[grams]] },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /addFilament - add a new filament colour
exports.addFilament = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { colorName, grams } = req.body;
      if (!colorName) return res.status(400).json({ error: "Missing colorName" });
      const sheets = await getSheets();
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Filament Inventory!A:B",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [[colorName, grams || 1000]] },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /deductFilament - deduct grams when design completed
exports.deductFilament = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { filaments } = req.body;
      if (!filaments || !filaments.length) return res.status(400).json({ error: "Missing filaments" });
      const sheets = await getSheets();
      const filamentRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Filament Inventory!A:B",
      });
      const rows = filamentRes.data.values || [];
      const updates = [];
      filaments.forEach(f => {
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] && rows[i][0].toLowerCase() === f.colorName.toLowerCase()) {
            const current = parseFloat(rows[i][1]) || 0;
            const newGrams = Math.max(0, current - f.grams);
            updates.push({ row: i + 1, grams: newGrams });
            rows[i][1] = newGrams;
            break;
          }
        }
      });
      for (const u of updates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: "Filament Inventory!B" + u.row,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[u.grams]] },
        });
      }
      res.status(200).json({ success: true, updates });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /setplannerstate - upsert a single plate's done state
exports.setplannerstate = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { designId, plateIndex, done } = req.body;
      if (designId === undefined || plateIndex === undefined) return res.status(400).json({ error: "Missing fields" });
      const sheets = await getSheets();

      // Ensure the Planner State sheet exists with a header
      let sheetData;
      try {
        sheetData = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Planner State!A:C" });
      } catch (e) {
        const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
        const exists = meta.data.sheets.find(s => s.properties.title === "Planner State");
        if (!exists) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            requestBody: { requests: [{ addSheet: { properties: { title: "Planner State" } } }] },
          });
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: "Planner State!A1:C1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [["Design ID", "Plate Index", "Done"]] },
          });
        }
        sheetData = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Planner State!A:C" });
      }

      const rows = sheetData.data.values || [];
      const key = String(designId);
      const pi = String(plateIndex);

      let existingRow = -1;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === key && String(rows[i][1]) === pi) {
          existingRow = i + 1;
          break;
        }
      }

      if (existingRow > -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: "Planner State!C" + existingRow,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[String(done)]] },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: "Planner State!A:C",
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: [[key, pi, String(done)]] },
        });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /updateOrder - update order-level fields (e.g. rush)
exports.updateOrder = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { orderId, rush } = req.body;
      if (!orderId) return res.status(400).json({ error: "Missing orderId" });
      const sheets = await getSheets();
      const ordersRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Orders!A:A" });
      const rows = ordersRes.data.values || [];
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === orderId) { rowIndex = i + 1; break; }
      }
      if (rowIndex < 0) return res.status(404).json({ error: "Order not found" });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: "Orders!L" + rowIndex,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[rush]] },
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

// POST /deleteOrder - delete entire order + all its items
exports.deleteOrder = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ error: "Missing orderId" });
      const sheets = await getSheets();
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
      const ordersSheet = meta.data.sheets.find(s => s.properties.title === "Orders");
      const itemsSheet = meta.data.sheets.find(s => s.properties.title === "Order Items");
      const [ordersRes, itemsRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Orders!A:A" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Order Items!A:A" }),
      ]);
      const orderRows = (ordersRes.data.values || []).map((r, i) => ({ val: r[0], idx: i })).filter(r => r.val === orderId).map(r => r.idx);
      const itemRows = (itemsRes.data.values || []).map((r, i) => ({ val: r[0], idx: i })).filter(r => r.val === orderId).map(r => r.idx);
      const requests = [];
      [...orderRows].sort((a, b) => b - a).forEach(idx => {
        requests.push({ deleteDimension: { range: { sheetId: ordersSheet.properties.sheetId, dimension: "ROWS", startIndex: idx, endIndex: idx + 1 } } });
      });
      [...itemRows].sort((a, b) => b - a).forEach(idx => {
        requests.push({ deleteDimension: { range: { sheetId: itemsSheet.properties.sheetId, dimension: "ROWS", startIndex: idx, endIndex: idx + 1 } } });
      });
      if (requests.length) {
        await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } });
      }
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});
