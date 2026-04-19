/**
 * Enrichment Loader Module
 * Fetches and renders enrichment content from the backend API
 * Reusable across all topic pages
 */

export async function loadEnrichment(containerId, apiUrl) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found`);
    return false;
  }

  try {
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Loading interactive content...</p>';

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    renderEnrichmentContent(container, data);
    return true;
  } catch (error) {
    console.error('Failed to load enrichment:', error);
    container.innerHTML = `
      <div style="padding: var(--space-lg); text-align: center; color: var(--text-muted);">
        <p>Interactive enrichment is currently unavailable.</p>
        <p style="font-size: 0.85rem; margin-top: var(--space-sm);">${error.message}</p>
      </div>
    `;
    return false;
  }
}

function renderEnrichmentContent(container, data) {
  container.innerHTML = '';

  // Detailed Explanation
  if (data.detailedExplanation) {
    const section = createSection('enrichment-block enrichment-block--detailed');
    section.innerHTML = '<h2>📚 Comprehensive Explanation</h2>';
    const textDiv = document.createElement('div');
    
    // Split by double newlines for proper paragraphs, or by single newlines if no double newlines
    const text = data.detailedExplanation;
    const paragraphs = text.includes('\n\n') 
      ? text.split('\n\n').filter(p => p.trim())
      : text.split('\n').filter(p => p.trim());
    
    textDiv.innerHTML = paragraphs
      .map(p => `<p>${p.trim()}</p>`)
      .join('');
    section.appendChild(textDiv);
    container.appendChild(section);
  }

  // Step-by-Step Guide
  if (data.stepByStepGuide && data.stepByStepGuide.length > 0) {
    const section = createSection('enrichment-block enrichment-block--steps');
    section.innerHTML = '<h2>🔍 Understanding the Concept Step-by-Step</h2>';
    const list = document.createElement('ol');
    list.className = 'steps-list';
    data.stepByStepGuide.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
  }


  // Key Takeaways
  if (data.keyTakeaways && data.keyTakeaways.length > 0) {
    const section = createSection('enrichment-block');
    section.innerHTML = '<h2>⭐ Key Takeaways</h2>';
    const ul = document.createElement('ul');
    data.keyTakeaways.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    section.appendChild(ul);
    container.appendChild(section);
  }

  // Common Misconceptions
  if (data.commonMisconceptions && data.commonMisconceptions.length > 0) {
    const section = createSection('enrichment-block enrichment-block--misconceptions');
    section.innerHTML = '<h2>🔴 Common Misconceptions & Corrections</h2>';
    const listDiv = document.createElement('div');
    listDiv.className = 'misconceptions-list';
    data.commonMisconceptions.forEach(item => {
      const card = document.createElement('div');
      card.className = 'misconception-card';
      card.innerHTML = `
        <h4 class="misconception-title"><span class="misconception-badge">❌ Myth:</span> ${item.misconception}</h4>
        <h4 class="correction-title"><span class="correction-badge">✅ Fact:</span> ${item.correction}</h4>
        <p class="misconception-explanation">${item.why}</p>
      `;
      listDiv.appendChild(card);
    });
    section.appendChild(listDiv);
    container.appendChild(section);
  }

  // Real-World Applications
  if (data.realWorldApplications && data.realWorldApplications.length > 0) {
    const section = createSection('enrichment-block enrichment-block--applications');
    section.innerHTML = '<h2>🌍 Real-World Applications</h2>';
    const listDiv = document.createElement('div');
    listDiv.className = 'applications-list';
    data.realWorldApplications.forEach(item => {
      const card = document.createElement('div');
      card.className = 'application-card';
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      `;
      listDiv.appendChild(card);
    });
    section.appendChild(listDiv);
    container.appendChild(section);
  }

  // Deeper Concepts / Advanced Topics
  if (data.deeperConcepts && data.deeperConcepts.length > 0) {
    const section = createSection('enrichment-block enrichment-block--advanced');
    section.innerHTML = '<h2>🎓 Advanced Topics</h2>';
    const listDiv = document.createElement('div');
    listDiv.className = 'advanced-topics-list';
    data.deeperConcepts.forEach(item => {
      const card = document.createElement('div');
      card.className = 'advanced-topic-card';
      card.innerHTML = `
        <h3>${item.concept}</h3>
        <p class="advanced-explanation">${item.explanation}</p>
        <p class="advanced-prerequisites"><strong>Prerequisites:</strong> ${item.prerequisites}</p>
      `;
      listDiv.appendChild(card);
    });
    section.appendChild(listDiv);
    container.appendChild(section);
  }

  // Interactive Quiz
  if (data.interactiveQuiz && data.interactiveQuiz.length > 0) {
    const section = createSection('enrichment-block enrichment-block--quiz');
    section.innerHTML = `
      <h2>✏️ Interactive Learning Quiz</h2>
      <p class="enrichment-quiz-intro">Test your understanding with questions at different difficulty levels.</p>
    `;
    const quizDiv = document.createElement('div');
    quizDiv.className = 'enrichment-quiz-questions';
    data.interactiveQuiz.forEach((q, idx) => {
      const qBlock = document.createElement('div');
      qBlock.className = 'enrichment-quiz-question';
      
      const promptP = document.createElement('p');
      promptP.className = 'quiz-question-prompt';
      promptP.innerHTML = `<strong>Question ${idx + 1}:</strong> ${q.prompt}`;
      
      const badge = document.createElement('span');
      badge.className = `difficulty-badge difficulty-badge--${q.difficulty}`;
      badge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
      promptP.appendChild(badge);
      
      qBlock.appendChild(promptP);

      const ul = document.createElement('ul');
      ul.className = 'quiz-options';
      q.options.forEach((opt, optIdx) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          const allBtns = ul.querySelectorAll('.quiz-option');
          allBtns.forEach(b => b.classList.remove('is-correct', 'is-incorrect'));
          if (optIdx === q.correctIndex) {
            btn.classList.add('is-correct');
          } else {
            btn.classList.add('is-incorrect');
          }
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      qBlock.appendChild(ul);

      if (q.explanation) {
        const exp = document.createElement('p');
        exp.className = 'muted quiz-explanation';
        exp.innerHTML = `<strong>Explanation:</strong> ${q.explanation}`;
        qBlock.appendChild(exp);
      }

      quizDiv.appendChild(qBlock);
    });
    section.appendChild(quizDiv);
    container.appendChild(section);
  }

  // Research Connections
  if (data.researchConnections && data.researchConnections.length > 0) {
    const section = createSection('enrichment-block');
    section.innerHTML = '<h2>🔬 Research Directions</h2>';
    const grid = document.createElement('div');
    grid.className = 'connections-grid';
    data.researchConnections.forEach(item => {
      const card = document.createElement('div');
      card.className = 'connection-card';
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      `;
      grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
  }
}

function createSection(className) {
  const section = document.createElement('section');
  section.className = className;
  return section;
}
