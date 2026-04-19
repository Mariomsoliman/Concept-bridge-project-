# Getting Started with Concept Bridge

This guide will get you up and running with both the frontend and backend in minutes.

## Quick Start (5 minutes)

### 1. Start the Frontend

```bash
cd /Users/mariamsoliman/Desktop/Mini-capstone
python3 -m http.server 8015
```

Open http://localhost:8015 in your browser.

### 2. Start the Backend (in a new terminal)

```bash
cd /Users/mariamsoliman/Desktop/Mini-capstone/backend
npm start
```

The API will be available at http://localhost:3000

### 3. Verify Everything Works

- **Home page**: http://localhost:8015 
- **Roadmap explorer**: http://localhost:8015/roadmap.html
- **DNA Replication lesson**: http://localhost:8015/dna-replication.html
- **Backend health**: `curl http://localhost:3000/health`

---

## Project Overview

**Frontend**: Static HTML/CSS/JS files served on port 8015
- `index.html` - Home page
- `roadmap.html` - Learning path explorer
- `dna-replication.html` - Example enriched lesson
- `complexity.html` - Another enriched lesson
- `python-roadmap.html`, `frontend-roadmap.html`, etc. - Role/skill paths

**Backend**: Node.js Express API on port 3000
- Serves enriched content via `/api/demo/enrichment` and `/api/demo/complexity`
- Uses Gemini API to structure educational content
- Can integrate with PubMed, Stack Exchange, arXiv, Crossref APIs

---

## Key Files

| File | Purpose |
|------|---------|
| `script.js` | Page interactions (panels, roadmap flow, demos) |
| `enrichment-loader.js` | Loads & renders enriched content from API |
| `styles.css` | Unified dark design system |
| `enrichment.css` | Styling for enriched content blocks |
| `backend/server.js` | Express server with API endpoints |
| `backend/gemini.js` | Gemini AI integration |
| `topics.json` | Topic database |

---

## Common Tasks

### View a Roadmap
- Biology: http://localhost:8015/biology-roadmap.html
- Python: http://localhost:8015/python-roadmap.html
- Frontend: http://localhost:8015/frontend-roadmap.html

### Test an Enriched Lesson
- Open http://localhost:8015/dna-replication.html
- Scroll down to see the Interactive Learning Explorer with:
  - Detailed explanation
  - Step-by-step guide
  - Visual diagram
  - Key takeaways
  - Quiz questions

### Add API Keys
1. Copy `backend/.env.example` to `backend/.env`
2. Add your `GEMINI_API_KEY`
3. Restart backend: `npm start`

### Debug the Backend
```bash
# Check if server is running
curl http://localhost:3000/health

# Test enrichment API
curl http://localhost:3000/api/demo/enrichment | jq .

# Watch logs
tail -f backend/server.log
```

---

## Troubleshooting

**"Address already in use :3000"**
- Another Node process is running on port 3000
- Kill it: `pkill -f "node server.js"`
- Then restart: `npm start`

**"Module not found" errors in backend**
- Install dependencies: `cd backend && npm install`

**Enrichment content not loading on lesson pages**
- Ensure backend is running: `curl http://localhost:3000/health`
- Check browser console for errors (F12)
- Verify CORS is configured: it should allow `http://localhost:8015`

**Styles look broken**
- Clear browser cache (Cmd+Shift+R)
- Ensure `styles.css` and `enrichment.css` are loaded
- Check browser DevTools (F12) for CSS file errors

---

## Next Steps

1. Explore the pages and roadmaps
2. Try the enriched lessons (DNA Replication, Complexity)
3. Add more lessons using the `dna-replication.html` pattern
4. Create additional roadmaps for other roles/skills
5. Connect real external APIs in `backend/topicConfig.js`

---

**Need help?** Check `README.md` for detailed documentation.
