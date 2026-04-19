import { fetchFromPubMed, fetchFromStackExchange, fetchFromArxiv, fetchFromCrossref } from './apis.js';

/**
 * Topic type and source configuration
 */
const TOPIC_CONFIG = {
  'dna-replication': {
    type: 'natural-science',
    field: 'Biology',
    queries: ['DNA replication molecular mechanism', 'DNA polymerase enzyme'],
    sources: ['pubmed'],
  },
  'forces-motion': {
    type: 'natural-science',
    field: 'Physics',
    queries: ['Newton laws motion physics', 'force acceleration mechanics'],
    sources: ['pubmed'],
  },
  'time-space-complexity': {
    type: 'computer-science',
    field: 'Algorithms',
    queries: ['time complexity space complexity', 'Big O notation algorithm analysis'],
    sources: ['stack-exchange', 'arxiv'],
  },
  python: {
    type: 'computer-science',
    field: 'Programming',
    queries: ['Python programming tutorial', 'Python best practices'],
    sources: ['stack-exchange'],
  },
  javascript: {
    type: 'computer-science',
    field: 'Web Development',
    queries: ['JavaScript programming tutorial', 'JavaScript best practices'],
    sources: ['stack-exchange'],
  },
  react: {
    type: 'computer-science',
    field: 'Web Development',
    queries: ['React component state hooks', 'React best practices'],
    sources: ['stack-exchange'],
  },
  sql: {
    type: 'computer-science',
    field: 'Databases',
    queries: ['SQL query writing database design', 'SQL optimization'],
    sources: ['stack-exchange'],
  },
  dsa: {
    type: 'computer-science',
    field: 'Algorithms',
    queries: ['Data structures algorithms trees graphs', 'Algorithm design patterns'],
    sources: ['stack-exchange', 'arxiv'],
  },
  'system-design': {
    type: 'computer-science',
    field: 'Systems',
    queries: ['System design distributed systems scalability', 'Microservices architecture'],
    sources: ['arxiv', 'crossref'],
  },
  docker: {
    type: 'computer-science',
    field: 'DevOps',
    queries: ['Docker containers containerization', 'Docker best practices'],
    sources: ['stack-exchange'],
  },
};

/**
 * Fetch content from appropriate sources based on topic type
 */
export async function fetchTopicContent(slug) {
  const config = TOPIC_CONFIG[slug];

  if (!config) {
    return {
      error: `Topic "${slug}" not configured for external content fetching`,
      enrichment: null,
    };
  }

  const sources = config.sources || [];
  const allArticles = [];

  // Fetch from each configured source
  for (const source of sources) {
    let result;
    const query = config.queries[0]; // Use the first query for simplicity

    switch (source) {
      case 'pubmed':
        result = await fetchFromPubMed(query, 5);
        break;
      case 'stack-exchange':
        result = await fetchFromStackExchange(query, 5);
        break;
      case 'arxiv':
        result = await fetchFromArxiv(query, 5);
        break;
      case 'crossref':
        result = await fetchFromCrossref(query, 5);
        break;
      default:
        result = { articles: [], source };
    }

    if (result.articles && result.articles.length > 0) {
      allArticles.push(...result.articles);
    }
  }

  return {
    slug,
    config,
    rawContent: {
      articleCount: allArticles.length,
      sources,
      articles: allArticles.slice(0, 10), // Cap at 10 for display and token usage
    },
  };
}
