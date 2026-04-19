import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Use Gemini to structure raw content into a standardized enrichment format
 */
export async function structureContentWithGemini(topic, rawArticles, topicType = 'general') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build a prompt that asks Gemini to structure the content
    const prompt = buildStructuringPrompt(topic, rawArticles, topicType);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response from Gemini
    let enrichedContent;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      enrichedContent = JSON.parse(jsonMatch?.[0] || responseText);
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON response, returning raw text:', parseError.message);
      enrichedContent = {
        simpleSummary: responseText.substring(0, 300),
        keyTakeaways: [],
        quizQuestions: [],
        connections: [],
      };
    }

    return enrichedContent;
  } catch (error) {
    console.error('Gemini structuring error:', error.message);
    return {
      simpleSummary: 'Unable to process content at this time.',
      keyTakeaways: [],
      quizQuestions: [],
      connections: [],
      error: error.message,
    };
  }
}

/**
 * Build a carefully crafted prompt for Gemini based on topic type
 */
function buildStructuringPrompt(topic, rawArticles, topicType) {
  const articlesText = rawArticles
    .slice(0, 5)
    .map((article, i) => {
      let text = `\n[Article ${i + 1}]\n`;
      if (article.title) text += `Title: ${article.title}\n`;
      if (article.authors) text += `Authors: ${article.authors}\n`;
      if (article.abstract || article.summary) text += `Content: ${article.abstract || article.summary}\n`;
      if (article.link) text += `Link: ${article.link}\n`;
      return text;
    })
    .join('\n');

  if (topicType === 'natural-science') {
    return `
You are a world-class science educator. I have retrieved recent research articles about "${topic}" from PubMed. Your task is to create a comprehensive, interactive learning experience.

Here are the articles:
${articlesText}

Please analyze this research and return a JSON object with the following structure:
{
  "detailedExplanation": "A 300-500 word comprehensive explanation that covers: (1) What is this concept?, (2) Why does it matter?, (3) How does it work? Break down complex ideas into understandable parts. Use analogies where helpful.",
  
  "stepByStepGuide": [
    "Step 1: Clear description of first concept or process",
    "Step 2: Next concept building on the first",
    "Step 3: How they connect together",
    "Step 4: Real-world implications"
  ],
  
  "visualDiagram": "Create an ASCII-art diagram or text-based visualization that shows the process or structure. Make it educational and easy to understand.",
  
  "keyTakeaways": [
    "One key fact or insight from the research",
    "Another important finding",
    "A third important concept",
    "A fourth insight",
    "A fifth takeaway"
  ],
  
  "interactiveQuiz": [
    {
      "prompt": "A conceptual question that tests understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong",
      "difficulty": "beginner"
    },
    {
      "prompt": "A more complex question that requires applying the concept",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Explanation with real-world context",
      "difficulty": "intermediate"
    },
    {
      "prompt": "An advanced question that combines multiple concepts",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Analysis of the concept's deeper implications",
      "difficulty": "advanced"
    }
  ],
  
  "realWorldApplications": [
    {
      "title": "Application 1: [Real-world use case]",
      "description": "How this concept is used in practice with specific examples"
    },
    {
      "title": "Application 2: [Another use case]",
      "description": "Another practical example with details"
    }
  ],
  
  "commonMisconceptions": [
    {
      "misconception": "A common wrong belief students have",
      "correction": "The correct understanding with explanation",
      "why": "Why people believe the misconception"
    },
    {
      "misconception": "Another common misunderstanding",
      "correction": "The accurate version",
      "why": "Why this confusion happens"
    }
  ],
  
  "deeperConcepts": [
    {
      "concept": "A related advanced topic",
      "explanation": "How this relates to the main concept",
      "whereToLearn": "Resources or areas to explore"
    },
    {
      "concept": "Another advanced extension",
      "explanation": "Connection to the main idea",
      "whereToLearn": "How to explore further"
    }
  ],
  
  "researchConnections": [
    {
      "title": "Related research direction 1",
      "description": "How this connects to other fields or future research"
    },
    {
      "title": "Related research direction 2",
      "description": "Another research avenue"
    }
  ],
  
  "source": "PubMed",
  "articleCount": ${rawArticles.length}
}

Respond ONLY with valid JSON, no markdown or extra text. Ensure all strings are valid JSON.
`;
  } else if (topicType === 'computer-science') {
    return `
You are a computer science educator and developer. I have retrieved practical and research content about "${topic}" from Stack Exchange and/or academic sources. Create an engaging, interactive learning experience.

Here are the resources:
${articlesText}

Please synthesize this information and return a JSON object with:
{
  "detailedExplanation": "A 300-500 word comprehensive explanation covering: (1) What is this concept?, (2) Why is it important in CS?, (3) How does it work technically?, (4) When and where is it used? Use clear analogies and examples.",
  
  "stepByStepGuide": [
    "Step 1: Foundational concept - simple explanation",
    "Step 2: Building on the foundation with more detail",
    "Step 3: How the parts work together",
    "Step 4: Common patterns or best practices",
    "Step 5: Real-world implementation considerations"
  ],
  
  "codeExample": "A simple, well-commented code snippet (pseudocode or actual code) that demonstrates the concept. Keep it concise and educational.",
  
  "keyTakeaways": [
    "A core concept or best practice",
    "A practical takeaway",
    "A common pitfall or antipattern to avoid",
    "A performance consideration",
    "An advanced insight"
  ],
  
  "interactiveQuiz": [
    {
      "prompt": "A beginner question testing basic understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation with examples",
      "difficulty": "beginner"
    },
    {
      "prompt": "An intermediate question about practical application",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Explanation with real-world context",
      "difficulty": "intermediate"
    },
    {
      "prompt": "An advanced question testing deep understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Analysis including edge cases and optimizations",
      "difficulty": "advanced"
    }
  ],
  
  "practicalProjects": [
    {
      "title": "Project 1: [Small project idea]",
      "description": "A beginner-friendly project to practice this concept",
      "difficulty": "beginner",
      "timeEstimate": "1-2 hours"
    },
    {
      "title": "Project 2: [Intermediate project]",
      "description": "A more complex project combining multiple concepts",
      "difficulty": "intermediate",
      "timeEstimate": "3-5 hours"
    }
  ],
  
  "performanceConsiderations": [
    {
      "aspect": "Time Complexity",
      "explanation": "How this concept scales with input size"
    },
    {
      "aspect": "Space Complexity",
      "explanation": "Memory usage and optimization strategies"
    },
    {
      "aspect": "Best Practices",
      "explanation": "Industry standards and common optimization techniques"
    }
  ],
  
  "commonMisconceptions": [
    {
      "misconception": "A common wrong belief programmers have",
      "correction": "The correct understanding",
      "example": "Code or example showing the difference"
    },
    {
      "misconception": "Another common misunderstanding",
      "correction": "The accurate version",
      "example": "Example demonstrating the correction"
    }
  ],
  
  "advancedTopics": [
    {
      "topic": "An advanced extension of this concept",
      "explanation": "How it builds on the main idea",
      "prerequisites": "What you should know first"
    },
    {
      "topic": "Another advanced variation",
      "explanation": "Different use cases or optimizations",
      "prerequisites": "Required foundational knowledge"
    }
  ],
  
  "practicalConnections": [
    {
      "title": "How to use this in practice",
      "description": "Real-world application or project idea with specific examples"
    },
    {
      "title": "Industry use case",
      "description": "How major companies or frameworks use this concept"
    }
  ],
  
  "source": "Stack Exchange / Academic",
  "resourceCount": ${rawArticles.length}
}

Respond ONLY with valid JSON, no markdown or extra text. Ensure all strings are valid JSON.
`;
  } else {
    return `
Analyze the following content about "${topic}" and return a structured JSON object:
${articlesText}

{
  "simpleSummary": "A 2-3 sentence summary",
  "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
  "quizQuestions": [
    {
      "prompt": "Question?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this is correct"
    }
  ],
  "connections": ["Related topic 1", "Related topic 2"]
}

Respond ONLY with valid JSON.
`;
  }
}
