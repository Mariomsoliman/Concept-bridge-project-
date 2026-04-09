# Concept Bridge 

Concept Bridge is a small static prototype of an interactive platform that connects **Natural Science** and **Computer Science** using a unified dark design, guided roadmaps, and reusable topic content.

## Main structure

- `index.html` – Home page with a hero, three primary cards, and hover/click panels for:
  - Explore Natural Science
  - Explore Computer Science
  - Open the Roadmap Explorer
- `ns.html` – Natural Science hub (Biology, Physics, Chemistry, Earth Science, Astronomy).
- `cs.html` – Computer Science hub (DSA, Software Engineering, Systems, AI/ML, Databases, Theory, Graphics / HCI).
- `roadmap.html` – Guided **Roadmap Explorer** that asks:
  - “What would you like to explore?” (Natural Science vs Computer Science)
  - For CS: “Which kind of roadmap do you want?” (Role-based vs Skill-based)
  and then reveals only the relevant roadmap cards.
- `cs-roadmap.html` – Detail view for a single CS roadmap (role or skill) rendered as a vertical path of steps.
- `topic.html` – **Reusable topic page** that loads topic data from `topics.json` based on a `slug` in the URL.
- `biology.html`, `physics.html`, `dsa.html` – Category hub pages that link into individual topics.
- `dna-replication.html`, `forces-motion.html`, `complexity.html` – Original lesson pages; content is being migrated into the JSON-based topic system.
- `topics.json` – Central store for topic content (slug, title, field, summary, video URL, sections, optional quiz, related topics).
- `styles.css` – Shared design system (dark theme, cards, pills, roadmap visuals, quiz and related-topic styles).
- `script.js` – Page behavior:
  - Home panels (hover/click expand)
  - Guided Roadmap Explorer (domain + role/skill flow)
  - CS roadmap detail rendering
  - Dynamic topic loader (fetches `topics.json` and renders `topic.html`)
  - Small lesson demos (DNA replication steps, forces & motion net force demo, complexity examples).

## Dynamic topic system

Topic content is no longer hardcoded into one HTML file per lesson. Instead:

- All topics live in `topics.json` under a top-level `topics` array.
- Each topic entry includes:
  - `slug` – unique identifier used in URLs (e.g. `dna-replication`).
  - `title` – display name of the topic.
  - `field` – short label for the area (e.g. `Biology • DNA`, `Physics`, `Computer Science`).
  - `summary` – 1–2 sentence overview.
  - `videoUrl` – optional embed URL for a video lesson (empty string for now).
  - `sections` – ordered content blocks with `id`, `title`, and `paragraphs`.
  - `quiz` (optional) – title and multiple-choice questions (prompt, options, `correctIndex`, explanation).
  - `related` – array of related topic slugs for cross-linking.

To view a topic, open `topic.html` with a `slug` query parameter, for example:

- `topic.html?slug=dna-replication`
- `topic.html?slug=forces-motion`
- `topic.html?slug=time-space-complexity`

The JavaScript in `script.js`:

- Reads `slug` from the query string.
- Fetches `topics.json`.
- Finds the matching topic.
- Renders the header, media block, content sections, optional quiz UI, and related-topic pills.

This keeps the HTML template simple and lets you add new topics just by editing `topics.json`.

## How to run locally

This is a pure static site. You can open files directly or use a tiny static server.

### Option 1: Open files directly

On macOS you can:

1. In VS Code, right-click `index.html` and choose **Open with Live Server** (if you have that extension), or
2. In Finder, double-click `index.html` to open it in your default browser.

For the dynamic topic page (`topic.html`), using a local server is recommended so that `fetch('topics.json')` works reliably.

### Option 2: Use a lightweight static server (Python)

From the project folder:

```bash
cd /Users/mariamsoliman/Desktop/Mini-capstone
python3 -m http.server 8015
```

Then open:

- `http://localhost:8015/index.html` – home page
- `http://localhost:8015/roadmap.html` – guided Roadmap Explorer
- `http://localhost:8015/topic.html?slug=dna-replication` – example dynamic topic


