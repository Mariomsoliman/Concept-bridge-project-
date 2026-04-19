import axios from 'axios';

/**
 * Fetch from PubMed using NCBI E-utilities
 * Returns a list of recent abstracts related to the query
 */
export async function fetchFromPubMed(query, limit = 5) {
  try {
    const searchUrl = `${process.env.PUBMED_BASE_URL}/esearch.fcgi`;
    const searchParams = {
      db: 'pubmed',
      term: query,
      retmax: limit,
      rettype: 'json',
      tool: 'concept-bridge',
      email: process.env.PUBMED_EMAIL,
    };

    const searchResponse = await axios.get(searchUrl, { params: searchParams });
    const ids = searchResponse.data?.esearchresult?.idlist || [];

    if (ids.length === 0) {
      return { articles: [], message: 'No articles found on PubMed' };
    }

    // Fetch full summaries for the IDs
    const summaryUrl = `${process.env.PUBMED_BASE_URL}/esummary.fcgi`;
    const summaryParams = {
      db: 'pubmed',
      id: ids.join(','),
      rettype: 'json',
      tool: 'concept-bridge',
      email: process.env.PUBMED_EMAIL,
    };

    const summaryResponse = await axios.get(summaryUrl, { params: summaryParams });
    const results = summaryResponse.data?.result;

    // Format the results
    const articles = ids
      .map((id) => {
        const article = results?.[id];
        if (!article) return null;
        return {
          id,
          title: article.title || 'Untitled',
          pubDate: article.pubdate || 'Unknown',
          authors: article.authors?.slice(0, 3).map((a) => a.name).join(', ') || 'Unknown',
          source: 'PubMed',
          abstract: article.source || '',
        };
      })
      .filter(Boolean);

    return { articles, source: 'PubMed' };
  } catch (error) {
    console.error('PubMed fetch error:', error.message);
    return {
      articles: [],
      error: error.message,
      source: 'PubMed',
    };
  }
}

/**
 * Fetch from Stack Exchange (Stack Overflow by default)
 * Returns recent questions and answers on a topic
 */
export async function fetchFromStackExchange(query, limit = 5) {
  try {
    const url = 'https://api.stackexchange.com/2.3/search/advanced';
    const params = {
      q: query,
      site: process.env.STACK_EXCHANGE_SITE || 'stackoverflow',
      pagesize: limit,
      order: 'desc',
      sort: 'votes',
      key: process.env.STACK_EXCHANGE_API_KEY,
    };

    const response = await axios.get(url, { params });
    const items = response.data?.items || [];

    const results = items
      .slice(0, limit)
      .map((item) => ({
        title: item.title,
        link: item.link,
        isAnswered: item.is_answered,
        viewCount: item.view_count,
        score: item.score,
        tags: item.tags,
        source: 'Stack Exchange',
      }))
      .filter(Boolean);

    return { articles: results, source: 'Stack Exchange' };
  } catch (error) {
    console.error('Stack Exchange fetch error:', error.message);
    return {
      articles: [],
      error: error.message,
      source: 'Stack Exchange',
    };
  }
}

/**
 * Fetch from arXiv API
 * Returns recent preprints on a topic
 */
export async function fetchFromArxiv(query, limit = 5) {
  try {
    const url = `${process.env.ARXIV_BASE_URL}`;
    const params = {
      search_query: `all:${query}`,
      start: 0,
      max_results: limit,
      sortBy: 'submittedDate',
      sortOrder: 'descending',
    };

    const response = await axios.get(url, { params });

    // Parse XML response (arXiv returns XML)
    const entries = response.data.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    const articles = entries
      .slice(0, limit)
      .map((entry) => {
        const titleMatch = entry.match(/<title[^>]*>([^<]+)<\/title>/);
        const summaryMatch = entry.match(/<summary[^>]*>([^<]+)<\/summary>/);
        const idMatch = entry.match(/<id>http:\/\/arxiv\.org\/abs\/([^\<]+)<\/id>/);
        const authorMatches = entry.match(/<author>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/author>/g) || [];
        const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);

        return {
          id: idMatch?.[1] || '',
          title: titleMatch?.[1]?.trim() || 'Untitled',
          summary: summaryMatch?.[1]?.trim() || '',
          authors: authorMatches
            .slice(0, 3)
            .map((a) => a.match(/<name>([^<]+)<\/name>/)?.[1])
            .filter(Boolean)
            .join(', '),
          published: publishedMatch?.[1]?.split('T')[0] || '',
          source: 'arXiv',
          link: `https://arxiv.org/abs/${idMatch?.[1] || ''}`,
        };
      })
      .filter(Boolean);

    return { articles, source: 'arXiv' };
  } catch (error) {
    console.error('arXiv fetch error:', error.message);
    return {
      articles: [],
      error: error.message,
      source: 'arXiv',
    };
  }
}

/**
 * Fetch from Crossref API
 * Returns scholarly article metadata
 */
export async function fetchFromCrossref(query, limit = 5) {
  try {
    const url = `${process.env.CROSSREF_BASE_URL}/works`;
    const params = {
      query,
      rows: limit,
      sort: 'relevance',
      'select': 'DOI,title,author,published-online,abstract',
    };

    const response = await axios.get(url, { params, timeout: 5000 });
    const items = response.data?.message?.items || [];

    const articles = items
      .slice(0, limit)
      .map((item) => ({
        doi: item.DOI || '',
        title: Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled',
        authors: item.author
          ?.slice(0, 3)
          .map((a) => `${a.given} ${a.family}`)
          .join(', ') || 'Unknown',
        publishedOnline: item['published-online']?.['date-parts']?.[0]?.join('-') || '',
        abstract: item.abstract || '',
        source: 'Crossref',
      }))
      .filter(Boolean);

    return { articles, source: 'Crossref' };
  } catch (error) {
    console.error('Crossref fetch error:', error.message);
    return {
      articles: [],
      error: error.message,
      source: 'Crossref',
    };
  }
}
