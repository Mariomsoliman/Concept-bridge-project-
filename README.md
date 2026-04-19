# Concept Bridge# Concept Bridge# Concept Bridge 



An interactive learning platform connecting **Natural Science** and **Computer Science** with a unified dark design, interactive learning explorers, comprehensive roadmaps, and enriched educational content.



## FeaturesAn interactive learning platform connecting **Natural Science** and **Computer Science** with a unified dark design, interactive learning explorers, comprehensive roadmaps, and enriched educational content.Concept Bridge is a small static prototype of an interactive platform that connects **Natural Science** and **Computer Science** using a unified dark design, guided roadmaps, and reusable topic content.



✨ **Interactive Learning Explorer** – Deep dive into topics with step-by-step guides, visual diagrams, key takeaways, quizzes, and real-world connections



🗺️ **Guided Roadmap Explorer** – Curated learning paths for biology, Python, frontend development, and other subjects## Features## Main structure



🎓 **Enriched Educational Content** – Gemini-powered summaries, structured explanations, and interconnected lessons



🎨 **Dark-themed, Beautiful UI** – Modern design with smooth animations and responsive layouts✨ **Interactive Learning Explorer** – Deep dive into topics with step-by-step guides, visual diagrams, key takeaways, quizzes, and real-world connections- `index.html` – Home page with a hero, three primary cards, and hover/click panels for:



## Project Structure  - Explore Natural Science



### Frontend (Static Files)🗺️ **Guided Roadmap Explorer** – Curated learning paths for biology, Python, frontend development, and other subjects  - Explore Computer Science



**Core Pages:**  - Open the Roadmap Explorer

- `index.html` – Home page with primary navigation and interactive panels

- `ns.html` – Natural Science hub (Biology, Physics, Chemistry, Earth Science, Astronomy)🎓 **Enriched Educational Content** – Gemini-powered summaries, structured explanations, and interconnected lessons- `ns.html` – Natural Science hub (Biology, Physics, Chemistry, Earth Science, Astronomy).

- `cs.html` – Computer Science hub (DSA, Software Engineering, Systems, AI/ML, Databases, Theory, Graphics/HCI)

- `cs.html` – Computer Science hub (DSA, Software Engineering, Systems, AI/ML, Databases, Theory, Graphics / HCI).

**Roadmap System:**

- `roadmap.html` – Guided Roadmap Explorer with domain and role/skill selection🎨 **Dark-themed, Beautiful UI** – Modern design with smooth animations and responsive layouts- `roadmap.html` – Guided **Roadmap Explorer** that asks:

- `cs-roadmap.html` – Detail view for a single CS roadmap (role or skill)

- `biology-roadmap.html`, `python-roadmap.html`, `frontend-roadmap.html` – Specific learning paths  - “What would you like to explore?” (Natural Science vs Computer Science)



**Category Hubs:**## Project Structure  - For CS: “Which kind of roadmap do you want?” (Role-based vs Skill-based)

- `biology.html`, `physics.html`, `dsa.html` – Category hub pages linking to topics

  and then reveals only the relevant roadmap cards.

**Enriched Lessons:**

- `dna-replication.html` – Interactive biology lesson with enrichment content### Frontend (Static Files)- `cs-roadmap.html` – Detail view for a single CS roadmap (role or skill) rendered as a vertical path of steps.

- `complexity.html` – Computer science lesson on time/space complexity

- `forces-motion.html` – Physics lesson with interactive demo- `topic.html` – **Reusable topic page** that loads topic data from `topics.json` based on a `slug` in the URL.



**Styling & Interaction:****Core Pages:**- `biology.html`, `physics.html`, `dsa.html` – Category hub pages that link into individual topics.

- `styles.css` – Shared design system (dark theme, cards, buttons, grid layouts)

- `enrichment.css` – Specialized styles for enrichment content blocks- `index.html` – Home page with primary navigation and interactive panels- `dna-replication.html`, `forces-motion.html`, `complexity.html` – Original lesson pages; content is being migrated into the JSON-based topic system.

- `script.js` – Page interactions (IIFEs for scope isolation)

- `enrichment-loader.js` – ES6 module for loading and rendering enriched content- `ns.html` – Natural Science hub (Biology, Physics, Chemistry, Earth Science, Astronomy)- `topics.json` – Central store for topic content (slug, title, field, summary, video URL, sections, optional quiz, related topics).



**Data:**- `cs.html` – Computer Science hub (DSA, Software Engineering, Systems, AI/ML, Databases, Theory, Graphics/HCI)- `styles.css` – Shared design system (dark theme, cards, pills, roadmap visuals, quiz and related-topic styles).

- `topics.json` – Central topic database with slug, title, field, summary, sections, quiz

- `script.js` – Page behavior:

### Backend (Node.js Express API)

**Roadmap System:**  - Home panels (hover/click expand)

Located in `/backend/`:

- `roadmap.html` – Guided Roadmap Explorer with domain and role/skill selection  - Guided Roadmap Explorer (domain + role/skill flow)

- `server.js` – Express API server with endpoints for enriched content

- `gemini.js` – Google Gemini integration for content structuring- `biology-roadmap.html` – 6-phase Biology Foundations learning path  - CS roadmap detail rendering

- `apis.js` – External API clients (PubMed, Stack Exchange, arXiv, Crossref)

- `topicConfig.js` – Topic configuration and content fetching logic- `python-roadmap.html` – 6-phase Python skill progression  - Dynamic topic loader (fetches `topics.json` and renders `topic.html`)

- `test-enrichment.js` – Testing utility for endpoints

- `package.json` – Dependencies (express, cors, dotenv, axios, @google/generative-ai)- `frontend-roadmap.html` – 6-phase Frontend Engineer role path  - Small lesson demos (DNA replication steps, forces & motion net force demo, complexity examples).

- `.env` – API keys and configuration (GEMINI_API_KEY, FRONTEND_URL, PORT)

- `.env.example` – Template for .env configuration- `cs-roadmap.html` – Generic role/skill roadmap detail view

- `README.md` – Backend-specific documentation

## Dynamic topic system

## How to Run

**Category Hubs:**

### Option 1: Python HTTP Server (Recommended for quick start)

- `biology.html`, `physics.html`, `dsa.html` – Topic category pages linking to individual lessonsTopic content is no longer hardcoded into one HTML file per lesson. Instead:

```bash

# Frontend only (no backend enrichment)

cd /Users/mariamsoliman/Desktop/Mini-capstone

python3 -m http.server 8015**Enriched Lesson Pages:**- All topics live in `topics.json` under a top-level `topics` array.

```

- `dna-replication.html` – Biology: DNA Replication with integrated Interactive Learning Explorer- Each topic entry includes:

Open http://localhost:8015 in your browser.

- `complexity.html` – Computer Science: Time & Space Complexity with enriched content  - `slug` – unique identifier used in URLs (e.g. `dna-replication`).

### Option 2: Live Server Extension (VS Code)

- `forces-motion.html` – Physics: Forces & Motion with interactive demo  - `title` – display name of the topic.

Right-click `index.html` → "Open with Live Server" (port 5500 by default)

  - `field` – short label for the area (e.g. `Biology • DNA`, `Physics`, `Computer Science`).

### Option 3: Node.js HTTP Server

**Styling & Interaction:**  - `summary` – 1–2 sentence overview.

```bash

# Frontend- `styles.css` – Unified design system (dark theme, cards, buttons, roadmap visuals, quiz styles)  - `videoUrl` – optional embed URL for a video lesson (empty string for now).

cd /Users/mariamsoliman/Desktop/Mini-capstone

npx http-server -p 8015- `enrichment.css` – Styling for enriched content blocks (explanations, guides, quizzes, takeaways)  - `sections` – ordered content blocks with `id`, `title`, and `paragraphs`.

```

- `script.js` – Page interactions (home panels, roadmap explorer flow, lessons, complexity demos)  - `quiz` (optional) – title and multiple-choice questions (prompt, options, `correctIndex`, explanation).

### Backend Setup (for enriched content)

- `enrichment-loader.js` – ES6 module that loads and renders enriched content from backend APIs  - `related` – array of related topic slugs for cross-linking.

```bash

# Install backend dependencies- `topics.json` – Central topic database (slug, title, field, summary, sections, quizzes, related topics)

cd backend

npm installTo view a topic, open `topic.html` with a `slug` query parameter, for example:



# Configure environment### Backend (Node.js + Express)

cp .env.example .env

nano .env  # Add your GEMINI_API_KEY- `topic.html?slug=dna-replication`



# Start backend serverLocated in `backend/` directory:- `topic.html?slug=forces-motion`

npm start

```- `topic.html?slug=time-space-complexity`



The backend will run on `http://localhost:3000`.- `server.js` – Express server (port 3000)



## API Endpoints  - `GET /health` – Health checkThe JavaScript in `script.js`:



### Frontend Server  - `GET /api/demo/enrichment` – DNA Replication enriched content

- **Home**: http://localhost:8015

- **Roadmap Explorer**: http://localhost:8015/roadmap.html  - `GET /api/demo/complexity` – Time & Space Complexity enriched content- Reads `slug` from the query string.

- **Enriched Lessons**: 

  - http://localhost:8015/dna-replication.html  - `GET /api/topic/:slug` – Real enrichment when APIs are configured- Fetches `topics.json`.

  - http://localhost:8015/complexity.html

- **Roadmaps**:  - Finds the matching topic.

  - http://localhost:8015/biology-roadmap.html

  - http://localhost:8015/python-roadmap.html- `gemini.js` – Gemini API integration for content structuring- Renders the header, media block, content sections, optional quiz UI, and related-topic pills.

  - http://localhost:8015/frontend-roadmap.html

- `apis.js` – External API integrations (PubMed, Stack Exchange, arXiv, Crossref)

### Backend API (Port 3000)

- **Health Check**: http://localhost:3000/health- `topicConfig.js` – Topic configuration and content fetching logicThis keeps the HTML template simple and lets you add new topics just by editing `topics.json`.

- **Enriched Content**: http://localhost:3000/api/demo/enrichment (DNA Replication)

- **Complexity Content**: http://localhost:3000/api/demo/complexity- `test-enrichment.js` – Testing utility for enrichment endpoints



## Technology Stack- `.env` – Environment variables (Gemini API key, external API credentials)## How to run locally



**Frontend:**- `package.json` – Node dependencies (Express, CORS, dotenv, Axios, Gemini AI)

- HTML5, CSS3 (with CSS custom properties), Vanilla JavaScript ES6

- No frameworks or build toolsThis is a pure static site. You can open files directly or use a tiny static server.

- Responsive design, dark theme

## Enriched Content System

**Backend:**

- Node.js 18+### Option 1: Open files directly

- Express.js framework

- Google Generative AI (Gemini API)The Interactive Learning Explorer provides 9+ types of educational content:

- External APIs: PubMed, Stack Exchange, arXiv, Crossref

On macOS you can:

**Design System:**

- Dark background (#0f172a)1. **Detailed Explanation** – 300-500 word deep dive into the topic

- Color palette: #7bffb3 (green), #4fb3ff (blue), #ff6b9d (pink), #ffd700 (gold)

- Responsive grid layouts2. **Step-by-Step Guide** – Structured learning progression1. In VS Code, right-click `index.html` and choose **Open with Live Server** (if you have that extension), or

- Card-based UI patterns

- Smooth animations and transitions3. **Visual Diagram** – ASCII art or visual representation2. In Finder, double-click `index.html` to open it in your default browser.



## Architecture Notes4. **Key Takeaways** – 5-7 critical concepts to remember



### Frontend Architecture5. **Common Misconceptions** – Address student confusionFor the dynamic topic page (`topic.html`), using a local server is recommended so that `fetch('topics.json')` works reliably.

- **IIFE Pattern**: script.js uses Immediately Invoked Function Expressions for scope isolation

- **ES6 Modules**: enrichment-loader.js as reusable module for content rendering6. **Real-World Applications** – Practical examples from industry

- **Graceful Degradation**: All interactions degrade gracefully if JavaScript is unavailable

- **Dark Theme with CSS Variables**: Easy customization through CSS custom properties7. **Interactive Quiz** – Multi-level questions (Beginner, Intermediate, Advanced)### Option 2: Use a lightweight static server (Python)



### Backend Architecture8. **Deeper Concepts** – Advanced topics for further exploration

- **Microservice Pattern**: Each API endpoint handles a specific concern

- **External API Integration**: Fetches from PubMed, Stack Exchange, arXiv, Crossref9. **Research Connections** – Links to cutting-edge academic workFrom the project folder:

- **Content Structuring**: Gemini API structures raw content into educational format

- **CORS Configuration**: Allows localhost:8015 to access backend APIs



## Documentation## How to Run Locally```bash



- **README.md** – This file; overview and setup instructionscd /Users/mariamsoliman/Desktop/Mini-capstone

- **GETTING_STARTED.md** – Quick start guide and common issues

- **PROJECT_STATUS.md** – Detailed status, metrics, and recommendations### Frontend (Static Files)python3 -m http.server 8015

- **backend/README.md** – Backend-specific documentation and API details

```

## Next Steps

**Option 1: Python Static Server** 

1. **Explore the Platform**: Visit http://localhost:8015 to see all features

2. **Try Enriched Content**: Visit DNA Replication or Complexity lessonsThen open:

3. **Add More Topics**: Edit backend/topicConfig.js to add more enriched topics

4. **Create More Roadmaps**: Use existing roadmap HTML files as templates```bash

5. **Deploy**: Deploy to a static hosting service (Netlify, Vercel, GitHub Pages) for frontend; Node.js hosting for backend

cd /Users/mariamsoliman/Desktop/Mini-capstone- `http://localhost:8015/index.html` – home page

## License

python3 -m http.server 8015- `http://localhost:8015/roadmap.html` – guided Roadmap Explorer

Part of the Concept Bridge project.

```- `http://localhost:8015/topic.html?slug=dna-replication` – example dynamic topic



Then open:

- Home: `http://localhost:8015`
- Roadmap: `http://localhost:8015/roadmap.html`
- DNA Replication: `http://localhost:8015/dna-replication.html`
- Complexity: `http://localhost:8015/complexity.html`

**Option 2: VS Code Live Server**

1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` and select "Open with Live Server"
3. Defaults to `http://localhost:5500`

**Option 3: Direct File Opening**

- On macOS: Double-click `index.html` in Finder
- Note: Some features (fetch, cross-origin) work better with a server

### Backend (Node.js API)

**Setup:**

```bash
# Navigate to backend directory
cd /Users/mariamsoliman/Desktop/Mini-capstone/backend

# Install dependencies
npm install

# Configure environment (create .env file)
# Copy .env.example to .env and add your API keys
cp .env.example .env

# Edit .env and add:
# GEMINI_API_KEY=your_key_here
# FRONTEND_URL=http://localhost:8015
# PORT=3000
```

**Run:**

```bash
# Start the server
npm start

# Or with watch mode for development
npm run dev
```

Server will be available at `http://localhost:3000`

**Health Check:**

```bash
curl http://localhost:3000/health
```

**Test Enriched Content:**

```bash
curl http://localhost:3000/api/demo/enrichment | jq .
curl http://localhost:3000/api/demo/complexity | jq .
```

## Ports

- **Frontend**: `8015` (Python server) or `5500` (Live Server)
- **Backend**: `3000` (Node.js Express)

## File Naming Conventions

- `*-roadmap.html` – Learning path pages (biology, python, frontend, etc.)
- `*-replication.html`, `forces-motion.html`, `complexity.html` – Enriched lesson pages
- `enrichment-*.js` – Client-side enrichment utilities
- `*.css` – Stylesheets (main, enrichment-specific)

## Technology Stack

- **Frontend**: HTML5, CSS3, vanilla JavaScript (ES6 modules where needed)
- **Backend**: Node.js, Express.js
- **APIs**: Google Gemini, PubMed, Stack Exchange, arXiv, Crossref
- **Styling**: CSS custom properties (variables), dark theme

## Architecture Notes

- **Modular Design**: Each page is self-contained but shares `styles.css` and `script.js`
- **No Build Tools**: Pure vanilla HTML/CSS/JS for simplicity and portability
- **Progressive Enhancement**: Works without JavaScript, enhanced with interactivity
- **API-Driven Content**: Backend fetches from research APIs, enriches with Gemini
- **Reusable Patterns**: Roadmaps, cards, quizzes, and panels use consistent markup
- **ES6 Modules**: `enrichment-loader.js` uses modern import/export syntax
"""
