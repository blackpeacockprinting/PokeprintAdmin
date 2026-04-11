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

// GET /getOrders - returns all orders, items and filament
exports.getOrders = onRequest({ cors: true, region: "us-central1" }, (req, res) => {
  cors(req, res, async () => {
    try {
      const sheets = await getSheets();
      const [ordersRes, itemsRes, filamentRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Orders!A:K" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Order Items!A:H" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Filament Inventory!A:B" }),
      ]);

      const ordersRows = ordersRes.data.values || [];
      const itemsRows = itemsRes.data.values || [];
      const filamentRows = filamentRes.data.values || [];

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

      res.status(200).json({ orders, items, filament });
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
      // Get sheet ID for Order Items tab
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
      // Add to Orders tab
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Orders!A:K",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [[id, customer, "", "", "Pending", payment || "Cash", notes || "", source || "Manual", date, "false", "false"]] },
      });
      // Add items to Order Items tab
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
