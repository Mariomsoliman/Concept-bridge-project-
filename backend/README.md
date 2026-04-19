# Concept Bridge Backend

This backend service fetches content from external research and Q&A APIs, then uses Google Gemini to structure and enrich that content for educational use.

## Architecture

### Workflow

1. **Frontend** sends a request to `/api/topic/:slug`.
2. **Backend** checks `topicConfig.js` to determine:
   - Topic type (natural-science or computer-science)
   - Which external APIs to query
   - What search queries to use
3. **Backend** fetches from external sources:
   - **Natural Science**: PubMed (research articles)
   - **Computer Science**: Stack Exchange (practical Q&A) + arXiv (research) + Crossref (metadata)
4. **Backend** sends raw content to **Google Gemini** with a structured prompt.
5. **Gemini** returns enriched JSON:
   - `simpleSummary` – beginner-friendly explanation
   - `keyTakeaways` – main insights
   - `quizQuestions` – auto-generated multiple-choice
   - `researchConnections` or `practicalConnections` – how this relates to other topics
6. **Frontend** displays the enriched content in dedicated sections.

## Setup

### Prerequisites

- Node.js 18+
- API keys for:
  - **Google Gemini**: Get one at [Google AI Studio](https://makersuite.google.com/app/apikey)

PubMed, arXiv, and Crossref are free and don't require API keys.

### Install & Configure

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Copy the example env file and fill in your API keys
cp .env.example .env

# Edit .env with your actual keys
nano .env  # or use your favorite editor
```

### .env file

```
GEMINI_API_KEY=your_gemini_api_key_here
PUBMED_EMAIL=your_email@example.com
STACK_EXCHANGE_API_KEY=your_stack_exchange_key_here (optional)
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8015
```

### Run

```bash
# Start the backend server
npm start

# Or, for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:3000`.

## API Endpoints

### `/health`

Quick health check.

```bash
curl http://localhost:3000/health
```

### `/api/topic/:slug`

Get enriched topic content from external sources + Gemini.

```bash
# DNA Replication (PubMed + Gemini)
curl http://localhost:3000/api/topic/dna-replication

# Time & Space Complexity (Stack Exchange + Gemini)
curl http://localhost:3000/api/topic/time-space-complexity

# Python skill (Stack Exchange + Gemini)
curl http://localhost:3000/api/topic/python
```

**Response:**

```json
{
  "slug": "dna-replication",
  "config": {
    "type": "natural-science",
    "field": "Biology",
    "sources": ["pubmed"]
  },
  "rawContentCount": 5,
  "rawSources": ["pubmed"],
  "enrichment": {
    "simpleSummary": "...",
    "keyTakeaways": ["...", "..."],
    "quizQuestions": [
      {
        "prompt": "...",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 0,
        "explanation": "..."
      }
    ],
    "researchConnections": [
      {
        "title": "...",
        "description": "..."
      }
    ],
    "source": "PubMed",
    "articleCount": 5
  }
}
```

### `/api/topic/:slug/raw`

Debug endpoint: get only raw external content without Gemini processing.

```bash
curl http://localhost:3000/api/topic/dna-replication/raw
```

### `/api/topics/configured`

List all topics configured for enrichment.

```bash
curl http://localhost:3000/api/topics/configured
```

## Topic Configuration

Edit `topicConfig.js` to add or modify topics:

```javascript
const TOPIC_CONFIG = {
  'my-topic': {
    type: 'natural-science' | 'computer-science',
    field: 'Category Name',
    queries: ['search query 1', 'search query 2'],
    sources: ['pubmed', 'stack-exchange', 'arxiv', 'crossref'],
  },
};
```

## External APIs Used

### PubMed (Natural Science)

- **URL**: https://www.ncbi.nlm.nih.gov/entrez/eutils
- **Cost**: Free
- **Rate limit**: ~10 requests/second (flexible)
- **Auth**: Email required (no API key)
- **Returns**: Recent research articles with abstracts

### Stack Exchange (Practical CS Topics)

- **URL**: https://api.stackexchange.com
- **Cost**: Free (with limitations) / Premium (unlimited)
- **Rate limit**: 300 requests/day (free), unlimited (premium)
- **Auth**: Optional API key
- **Returns**: Q&A, upvoted answers, tags, view counts

### arXiv (Research CS Topics)

- **URL**: http://export.arxiv.org/api/query
- **Cost**: Free
- **Rate limit**: 3 seconds per request (no rapid queries)
- **Auth**: None
- **Returns**: Preprints with titles, abstracts, author names

### Crossref (Scholarly Metadata)

- **URL**: https://api.crossref.org
- **Cost**: Free
- **Rate limit**: Polite use (no aggressive scraping)
- **Auth**: None
- **Returns**: DOI metadata, article titles, authors, abstracts

### Google Gemini (Content Structuring)

- **URL**: https://generativelanguage.googleapis.com
- **Cost**: Free tier available, paid for higher usage
- **Auth**: API key (get at makersuite.google.com)
- **Returns**: JSON-structured educational content

## Development Tips

### Test a specific topic's raw content

```bash
curl http://localhost:3000/api/topic/time-space-complexity/raw | jq
```

### Test enrichment with Gemini

```bash
curl http://localhost:3000/api/topic/dna-replication | jq '.enrichment'
```

### Debug logs

Set `NODE_ENV=development` in `.env` to see detailed logs and error messages.

### Common errors

- **"No external content found"**: The search queries might not return results. Edit `topicConfig.js` and try different keywords.
- **Gemini timeout**: If Gemini takes too long, increase the timeout in `server.js` or simplify the prompt.
- **PubMed rate limit**: Add a short delay between requests if you're bulk-processing many topics.

## Future enhancements

- Cache enriched content to avoid re-fetching for every request.
- Add support for other external APIs (Papers With Code, GitHub Discussions, Hacker News, etc.).
- Allow frontend to specify which sources to use per-request.
- Add support for multiple queries per topic and aggregating results.
- Implement proper error recovery and retry logic.
- Add database to store enriched content and topic metadata.


