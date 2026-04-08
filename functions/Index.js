const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Octokit } = require('@octokit/rest');

admin.initializeApp();
const db = admin.firestore();

// CORS middleware
const cors = require('cors')({ origin: true });

// GitHub API helper
async function githubApi(token, owner, repo, endpoint, options = {}) {
    const octokit = new Octokit({ auth: token });
    const url = `/repos/${owner}/${repo}${endpoint}`;

    const response = await octokit.request(`${options.method || 'GET'} ${url}`, {
        ...options,
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        }
    });

    return response.data;
}

// Get file contents from GitHub
exports.getGitHubFile = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { token, owner, repo, path } = req.body;

            if (!token || !owner || !repo || !path) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const data = await githubApi(token, owner, repo, `/contents/${path}`);

            // Decode content if it exists
            let content = null;
            if (data.content) {
                content = JSON.parse(Buffer.from(data.content, 'base64').toString());
            }

            return res.json({
                content: content,
                sha: data.sha,
                exists: !!data.content
            });
        } catch (error) {
            console.error('Error:', error);
            if (error.status === 404) {
                return res.status(404).json({ error: 'File not found' });
            }
            return res.status(500).json({ error: error.message });
        }
    });
});

// Save file contents to GitHub
exports.saveGitHubFile = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { token, owner, repo, path, content, sha, message } = req.body;

            if (!token || !owner || !repo || !path || content === undefined) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const contentEncoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

            const body = {
                message: message || `Update ${path}`,
                content: contentEncoded,
                branch: 'main'
            };

            if (sha) body.sha = sha;

            const data = await githubApi(token, owner, repo, `/contents/${path}`, {
                method: 'PUT',
                body: body
            });

            return res.json({
                success: true,
                sha: data.content.sha,
                message: 'File saved successfully'
            });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

// Sync N3D designs
exports.syncN3D = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { token, owner, repo, n3dApiKey } = req.body;

            if (!token || !owner || !repo || !n3dApiKey) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            // Fetch from N3D API
            const allDesigns = [];
            let page = 1;
            let hasMore = true;

            while (hasMore && page <= 10) {
                const response = await fetch(`https://www.n3dmelbourne.com/api/v1/designs?page=${page}&limit=200`, {
                    headers: { 'Authorization': `Bearer ${n3dApiKey}` }
                });

                if (!response.ok) throw new Error('N3D API error');

                const data = await response.json();
                const pageDesigns = data.data || [];

                if (pageDesigns.length === 0) {
                    hasMore = false;
                } else {
                    allDesigns.push(...pageDesigns);
                    page++;
                }
            }

            // Transform designs
            const designs = allDesigns.map(d => ({
                id: d.slug || d.id,
                name: d.title || d.name,
                pokedexNumber: d.pokedex_number,
                grams: d.total_weight_grams || d.weight_grams || d.weight || d.grams || 50,
                filamentColors: d.filament_colors || d.filaments || [],
                category: d.category || 'Pokemon',
                lastSynced: new Date().toISOString()
            }));

            // Save to GitHub
            const designsPath = 'data/n3d-designs.json';
            let sha = null;

            try {
                const existing = await githubApi(token, owner, repo, `/contents/${designsPath}`);
                sha = existing.sha;
            } catch (e) {
                // File doesn't exist yet
            }

            const contentEncoded = Buffer.from(JSON.stringify(designs, null, 2)).toString('base64');

            await githubApi(token, owner, repo, `/contents/${designsPath}`, {
                method: 'PUT',
                body: {
                    message: `Sync ${designs.length} N3D designs`,
                    content: contentEncoded,
                    sha: sha,
                    branch: 'main'
                }
            });

            return res.json({
                success: true,
                count: designs.length,
                message: `Synced ${designs.length} designs`
            });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ error: error.message });
        }
    });
});

// HTTP trigger for testing
exports.helloWorld = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        res.json({ message: 'PokePrint Cloud Function is running!' });
    });
});
