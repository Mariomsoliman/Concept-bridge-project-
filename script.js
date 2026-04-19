/**
 * Concept Bridge - Main Interactivity Script
 * 
 * This file provides core interactions for the platform:
 * 1. Home page panels - Expandable panels for exploring domains
 * 2. Roadmap Explorer - Guided flow: select domain → role/skill → roadmap
 * 3. CS Roadmap Detail - Renders role/skill-based learning paths
 * 4. Simple lesson interactions - Forces demo, complexity examples
 * 
 * Uses IIFEs to keep each feature's scope isolated and avoid global pollution.
 * All interactions degrade gracefully if elements aren't present.
 */

// Utility: safe query helpers
function $(selector, parent) {
  return (parent || document).querySelector(selector);
}

function $all(selector, parent) {
  return Array.from((parent || document).querySelectorAll(selector));
}

// Home page dropdown panels (for the simple semantic homepage)
(function initHomePanels() {
  // Links in the main options list
  const mappings = [
    { selector: 'a[href="#natural-science"]', panelId: 'natural-science' },
    { selector: 'a[href="#computer-science"]', panelId: 'computer-science' },
    { selector: 'a[href="#roadmap"]', panelId: 'roadmap' },
  ];

  const panels = mappings
    .map((m) => document.getElementById(m.panelId))
    .filter((el) => el !== null);

  if (!panels.length) return; // Not on the home page

  // Ensure all panels start collapsed but present in the layout
  panels.forEach((panel) => {
    panel.classList.remove('is-open');
    panel.removeAttribute('hidden');
  });

  let hideTimeoutId = null;

  function setOpenPanel(panelToShow) {
    panels.forEach((panel) => {
      if (panelToShow && panel === panelToShow) {
        panel.classList.add('is-open');
      } else {
        panel.classList.remove('is-open');
      }
    });

    // Update aria-expanded on each trigger link
    mappings.forEach((mapping) => {
      const link = $(mapping.selector);
      const panel = document.getElementById(mapping.panelId);
      if (!link || !panel) return;
      const expanded = Boolean(panelToShow && panel === panelToShow && panel.classList.contains('is-open'));
      link.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  function closeAllPanels() {
    setOpenPanel(null);
  }

  function cancelHide() {
    if (hideTimeoutId !== null) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
  }

  function scheduleHide() {
    cancelHide();
    hideTimeoutId = setTimeout(() => {
      closeAllPanels();
    }, 120);
  }

  mappings.forEach((mapping) => {
    const link = $(mapping.selector);
    const panel = document.getElementById(mapping.panelId);
    if (!link || !panel) return;

    // Make the link behave like a simple toggle control for screen readers
    link.setAttribute('aria-controls', panel.id);
    link.setAttribute('aria-expanded', 'false');
    // Prevent the hash link from jumping the page; treat click like an explicit open
    link.addEventListener('click', (event) => {
      event.preventDefault();
      cancelHide();
      setOpenPanel(panel);
    });

    // Show the corresponding panel on hover or keyboard focus
    link.addEventListener('mouseenter', () => {
      cancelHide();
      setOpenPanel(panel);
    });

    link.addEventListener('focus', () => {
      cancelHide();
      setOpenPanel(panel);
    });

    // When leaving the card, schedule closing unless the pointer moves into the panel
    link.addEventListener('mouseleave', () => {
      scheduleHide();
    });

    link.addEventListener('blur', () => {
      scheduleHide();
    });

    // Keep the panel open while hovered
    panel.addEventListener('mouseenter', () => {
      cancelHide();
    });

    panel.addEventListener('mouseleave', () => {
      scheduleHide();
    });
  });
})();

// Roadmap Explorer: guided, question-based flow
(function initRoadmapExplorer() {
  const domainButtons = $all('.roadmap-domain-card');
  const kindButtons = $all('.roadmap-kind-card');
  const nsSection = document.getElementById('roadmap-ns');
  const csRoleSection = document.getElementById('roadmap-cs-role');
  const csSkillSection = document.getElementById('roadmap-cs-skill');
  const kindStep = document.getElementById('roadmap-kind-step');

  if (!domainButtons.length || !nsSection || !kindStep) return; // Not on roadmap explorer page

  const flowSections = [kindStep, nsSection, csRoleSection, csSkillSection].filter(Boolean);

  function hideSection(section) {
    if (!section) return;
    section.classList.remove('is-visible');
    section.setAttribute('aria-hidden', 'true');
    section.setAttribute('hidden', 'true');
  }

  function showSection(section) {
    if (!section) return;
    section.removeAttribute('hidden');
    section.setAttribute('aria-hidden', 'false');
    // Let the browser apply the transition cleanly
    requestAnimationFrame(() => {
      section.classList.add('is-visible');
    });
  }

  function resetKindSelection() {
    kindButtons.forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
  }

  function setDomain(domainKey) {
    // Update first-question buttons
    domainButtons.forEach((button) => {
      const isActive = button.dataset.domain === domainKey;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Hide everything that can be revealed later
    flowSections.forEach(hideSection);

    if (domainKey === 'ns') {
      resetKindSelection();
      showSection(nsSection);
    } else if (domainKey === 'cs') {
      // Show the second question but no specific CS cards yet
      showSection(kindStep);
    }
  }

  function setKind(kindKey) {
    // Update second-question buttons
    kindButtons.forEach((button) => {
      const isActive = button.dataset.kind === kindKey;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Only ever show one CS group at a time
    hideSection(csRoleSection);
    hideSection(csSkillSection);

    if (kindKey === 'role') {
      showSection(csRoleSection);
    } else if (kindKey === 'skill') {
      showSection(csSkillSection);
    }
  }

  domainButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const domain = button.dataset.domain;
      if (!domain) return;
      setDomain(domain);
    });
  });

  kindButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.kind;
      if (!kind) return;
      setKind(kind);
    });
  });

  // Initial state: show only the first question; everything else stays hidden
  flowSections.forEach(hideSection);
})();

// CS roadmap detail page (role- and skill-based paths)
(function initCsRoadmapDetail() {
  const container = document.getElementById('roadmap-detail');
  if (!container) return; // Not on CS roadmap detail page

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  const rawType = getParam('type');
  const type = rawType === 'skill' ? 'skill' : 'role';
  const key = getParam('key') || (type === 'skill' ? 'python' : 'frontend');

  const DEFINITIONS = {
    role: {
      frontend: {
        title: 'Frontend Engineer roadmap',
        subtitle:
          'Build user interfaces from first HTML tags through modern component-based apps.',
        steps: [
          {
            title: 'Web foundations: HTML & CSS',
            body:
              'Learn how the web works, basic HTML structure, semantic tags, and modern CSS layout (Flexbox, Grid). Build a few simple static pages.',
          },
          {
            title: 'JavaScript basics',
            body:
              'Understand variables, functions, arrays, objects, and the DOM. Practice by adding small interactive behaviors to your pages.',
          },
          {
            title: 'Frontend tooling',
            body:
              'Get comfortable with the browser devtools, npm, and simple build tooling. Learn how to structure a small frontend project.',
          },
          {
            title: 'React and component design',
            body:
              'Learn React fundamentals: components, props, state, and effects. Build a small multi-page interface such as a dashboard or learning hub.',
          },
          {
            title: 'State, data, and APIs',
            body:
              'Fetch data from simple APIs, manage loading and error states, and organize your code for maintainability.',
          },
          {
            title: 'Polish, accessibility, and portfolio',
            body:
              'Improve visual design, responsiveness, and accessibility. Turn your best projects into a polished portfolio site.',
          },
        ],
      },
      backend: {
        title: 'Backend Engineer roadmap',
        subtitle:
          'Design and build APIs, work with databases, and reason about performance and reliability.',
        steps: [
          {
            title: 'Programming language foundations',
            body:
              'Choose a backend language (such as Python, JavaScript/Node, or Java) and learn syntax, control flow, and basic data structures.',
          },
          {
            title: 'HTTP, REST, and simple APIs',
            body:
              'Understand HTTP, routes, and JSON. Build a small REST API that serves and stores basic data.',
          },
          {
            title: 'Databases and modeling',
            body:
              'Learn SQL and relational modeling. Practice designing tables, writing queries, and connecting your API to a database.',
          },
          {
            title: 'Authentication and security basics',
            body:
              'Add login, sessions or tokens, and basic input validation. Learn about common web vulnerabilities and how to avoid them.',
          },
          {
            title: 'Scaling and observability',
            body:
              'Explore caching, background jobs, logging, and monitoring. Learn how to reason about performance and reliability under load.',
          },
          {
            title: 'Backend project',
            body:
              'Build a complete backend for a small app (for example, a learning tracker), including authentication, data modeling, and documentation.',
          },
        ],
      },
      fullstack: {
        title: 'Full-Stack Engineer roadmap',
        subtitle:
          'Combine frontend and backend skills to deliver complete user-facing products.',
        steps: [
          {
            title: 'Frontend and backend foundations',
            body:
              'Reach a basic level of comfort with HTML, CSS, JavaScript, and one backend language. Build simple projects on each side.',
          },
          {
            title: 'End-to-end web app',
            body:
              'Connect a frontend UI to a backend API you wrote. Handle loading states, errors, and form submissions across the stack.',
          },
          {
            title: 'Authentication and authorization',
            body:
              'Implement signup, login, and role-based access. Understand how cookies, tokens, and sessions fit together.',
          },
          {
            title: 'Deployment and DevOps basics',
            body:
              'Deploy your app to a cloud platform. Learn about environment variables, logs, and monitoring.',
          },
          {
            title: 'Refinement and testing',
            body:
              'Add automated tests, refactor for clarity, and document your APIs and UI flows.',
          },
          {
            title: 'Capstone full-stack project',
            body:
              'Design and ship a project that solves a real problem, showcasing your full-stack skills from database to UX.',
          },
        ],
      },
      ai: {
        title: 'AI / ML Engineer roadmap',
        subtitle:
          'Move from math and programming foundations into training and deploying models.',
        steps: [
          {
            title: 'Math and Python foundations',
            body:
              'Strengthen your linear algebra, probability, and calculus basics while becoming comfortable with Python for data work.',
          },
          {
            title: 'Data handling and analysis',
            body:
              'Use libraries like NumPy and pandas to explore datasets, clean data, and compute useful statistics.',
          },
          {
            title: 'Classical machine learning',
            body:
              'Learn core algorithms (linear models, trees, ensembles) and how to evaluate models properly.',
          },
          {
            title: 'Deep learning foundations',
            body:
              'Understand neural networks, automatic differentiation, and training loops with a framework such as PyTorch or TensorFlow.',
          },
          {
            title: 'Applied projects',
            body:
              'Work on small end-to-end projects: data prep, model training, evaluation, and simple deployment or demos.',
          },
          {
            title: 'Responsible AI and iteration',
            body:
              'Study fairness, privacy, and reliability. Iterate on your models with a focus on real-world constraints.',
          },
        ],
      },
      'data-analyst': {
        title: 'Data Analyst roadmap',
        subtitle: 'Turn raw data into clear, actionable insights and visual stories.',
        steps: [
          {
            title: 'Spreadsheet and SQL basics',
            body:
              'Learn to explore data with spreadsheets and write simple SQL queries to filter, join, and aggregate information.',
          },
          {
            title: 'Statistics and data cleaning',
            body:
              'Review descriptive statistics and basic probability. Practice cleaning messy, real-world datasets.',
          },
          {
            title: 'Visualization and dashboards',
            body:
              'Use tools or libraries to build charts and dashboards that highlight trends and comparisons clearly.',
          },
          {
            title: 'Business questions and storytelling',
            body:
              'Practice framing questions, choosing the right metrics, and communicating results to non-technical audiences.',
          },
          {
            title: 'Analyst portfolio projects',
            body:
              'Create 2–3 end-to-end analyses that showcase your ability to clean, analyze, and present data-driven recommendations.',
          },
        ],
      },
      devops: {
        title: 'DevOps / Cloud Engineer roadmap',
        subtitle:
          'Focus on automation, reliability, and tooling that keeps software running smoothly.',
        steps: [
          {
            title: 'OS and networking fundamentals',
            body:
              'Understand processes, filesystems, basic networking, and how applications run on servers.',
          },
          {
            title: 'Scripting and automation',
            body:
              'Use a scripting language (such as Bash or Python) to automate repetitive tasks and manage simple deployments.',
          },
          {
            title: 'Containers and orchestration',
            body:
              'Learn Docker, images, and containers. Then explore orchestration tools like Kubernetes at a conceptual level.',
          },
          {
            title: 'CI/CD pipelines',
            body:
              'Set up a simple continuous integration pipeline that runs tests and deployments automatically.',
          },
          {
            title: 'Observability and incident response',
            body:
              'Instrument applications with logs and metrics, and practice responding to simulated outages.',
          },
        ],
      },
      cybersecurity: {
        title: 'Cybersecurity Engineer roadmap',
        subtitle:
          'Learn how systems fail, how attackers think, and how to design safer software.',
        steps: [
          {
            title: 'Security mindset and basics',
            body:
              'Study core security principles such as least privilege, defense in depth, and secure defaults.',
          },
          {
            title: 'Web and application security',
            body:
              'Learn about common vulnerabilities (like XSS and SQL injection) and how to prevent them.',
          },
          {
            title: 'Systems and network security',
            body:
              'Explore authentication, encryption, secure protocols, and basic network defense techniques.',
          },
          {
            title: 'Threat modeling and testing',
            body:
              'Practice modeling how an attacker might approach a system and design mitigations. Learn about security testing tools.',
          },
          {
            title: 'Security projects and ethics',
            body:
              'Work on lab-style projects in controlled environments and study the ethics and laws around security work.',
          },
        ],
      },
      ux: {
        title: 'UX / Product Designer roadmap',
        subtitle:
          'Blend user research, interaction design, and prototyping into a product-focused practice.',
        steps: [
          {
            title: 'Design foundations',
            body:
              'Learn visual design basics, typography, color, and layout. Study examples of strong product design.',
          },
          {
            title: 'User research and discovery',
            body:
              'Practice interviewing users, synthesizing insights, and turning them into clear problem statements.',
          },
          {
            title: 'Interaction design and flows',
            body:
              'Sketch user flows and wireframes. Focus on clarity, feedback, and reducing friction in key tasks.',
          },
          {
            title: 'Prototyping and testing',
            body:
              'Build clickable prototypes and test them with users, iterating based on what you learn.',
          },
          {
            title: 'Design portfolio',
            body:
              'Document your projects as case studies showing your process from research through design decisions.',
          },
        ],
      },
    },
    skill: {
      python: {
        title: 'Python skill roadmap',
        subtitle: 'Use Python for scripts, data work, and prototyping.',
        steps: [
          {
            title: 'Core syntax and types',
            body:
              'Learn variables, control flow, functions, lists, dicts, and modules. Solve small exercises to build fluency.',
          },
          {
            title: 'Working with files and libraries',
            body:
              'Practice reading and writing files, using virtual environments, and installing third-party packages.',
          },
          {
            title: 'Data and scripting projects',
            body:
              'Automate simple tasks (like parsing logs) and explore small datasets using Python libraries.',
          },
          {
            title: 'Applied focus area',
            body:
              'Choose a focus such as web backends, data analysis, or scripting for research, and build 1–2 small projects there.',
          },
        ],
      },
      javascript: {
        title: 'JavaScript skill roadmap',
        subtitle: 'Master the language that powers interactive web experiences.',
        steps: [
          {
            title: 'Language fundamentals',
            body:
              'Study variables, functions, objects, arrays, and prototypes. Practice with small, focused exercises.',
          },
          {
            title: 'The browser environment',
            body:
              'Learn about the DOM, events, and asynchronous behavior (promises and async/await).',
          },
          {
            title: 'Modular code and tooling',
            body:
              'Organize your code into modules, and learn basic bundling or build tools as needed.',
          },
          {
            title: 'Project work',
            body:
              'Build a few interactive mini-apps that exercise your understanding of state and events.',
          },
        ],
      },
      react: {
        title: 'React skill roadmap',
        subtitle: 'Build reusable components and predictable UI flows.',
        steps: [
          {
            title: 'React core ideas',
            body:
              'Understand JSX, components, props, and state. Rebuild small UIs you already know using components.',
          },
          {
            title: 'Effects, data fetching, and routing',
            body:
              'Use hooks for side effects and data loading, and set up client-side routing for multi-page experiences.',
          },
          {
            title: 'State management patterns',
            body:
              'Explore patterns like lifting state, context, or light-weight state libraries as your apps grow.',
          },
          {
            title: 'Production-ready React',
            body:
              'Focus on performance, accessibility, and testing for React components and flows.',
          },
        ],
      },
      sql: {
        title: 'SQL skill roadmap',
        subtitle: 'Query and model relational data with confidence.',
        steps: [
          {
            title: 'Reading tables and simple queries',
            body:
              'Learn to select columns, filter rows, and sort results. Practice on small, realistic datasets.',
          },
          {
            title: 'Joins and aggregations',
            body:
              'Understand INNER/LEFT joins, GROUP BY, and aggregate functions to answer richer questions.',
          },
          {
            title: 'Modeling and constraints',
            body:
              'Design simple schemas with keys and constraints, and understand how they support data integrity.',
          },
          {
            title: 'Performance awareness',
            body:
              'Get a basic feel for indexes, query plans, and how to keep queries efficient.',
          },
        ],
      },
      dsa: {
        title: 'Data Structures & Algorithms roadmap',
        subtitle: 'Strengthen your problem-solving foundations.',
        steps: [
          {
            title: 'Core data structures',
            body:
              'Study arrays, linked lists, stacks, queues, hash maps, and trees, and implement them in a language you know.',
          },
          {
            title: 'Algorithm patterns',
            body:
              'Practice common techniques like two pointers, divide and conquer, recursion, and dynamic programming.',
          },
          {
            title: 'Complexity and trade-offs',
            body:
              'Use Big-O notation to compare solutions and reason about time and space cost.',
          },
          {
            title: 'Interview-style practice',
            body:
              'Solve timed problems and reflect on patterns you use most often.',
          },
        ],
      },
      'html-css': {
        title: 'HTML & CSS roadmap',
        subtitle: 'Craft accessible, responsive layouts for the web.',
        steps: [
          {
            title: 'HTML structure and semantics',
            body:
              'Learn core tags, document structure, and semantic elements that communicate meaning.',
          },
          {
            title: 'CSS layout techniques',
            body:
              'Practice Flexbox and Grid, responsive design, and common layout patterns.',
          },
          {
            title: 'Design systems and components',
            body:
              'Create reusable button, card, and layout components, and organize your CSS for reuse.',
          },
          {
            title: 'Accessibility and polish',
            body:
              'Focus on color contrast, keyboard navigation, and small interaction details that improve UX.',
          },
        ],
      },
      'system-design': {
        title: 'System Design roadmap',
        subtitle: 'Think in terms of components, interactions, and performance at scale.',
        steps: [
          {
            title: 'Foundational concepts',
            body:
              'Review clients and servers, latency vs. throughput, and the idea of scaling horizontally vs. vertically.',
          },
          {
            title: 'Core building blocks',
            body:
              'Understand databases, caches, queues, and load balancers and how they fit together.',
          },
          {
            title: 'Designing simple systems',
            body:
              'Walk through the design of familiar systems (like a URL shortener) and justify trade-offs.',
          },
          {
            title: 'Resilience and evolution',
            body:
              'Study replication, sharding, and fault tolerance patterns, and how systems evolve over time.',
          },
        ],
      },
      docker: {
        title: 'Docker skill roadmap',
        subtitle: 'Package and run software reliably using containers.',
        steps: [
          {
            title: 'Containers vs. virtual machines',
            body:
              'Learn what containers are, how they differ from VMs, and why they are useful for development and deployment.',
          },
          {
            title: 'Images and Dockerfiles',
            body:
              'Write simple Dockerfiles, build images, and run containers locally.',
          },
          {
            title: 'Compose and multi-service apps',
            body:
              'Use Docker Compose to run multi-container applications such as a web app plus database.',
          },
          {
            title: 'Pushing images and basic security',
            body:
              'Push images to a registry and learn basic best practices for image size and security.',
          },
        ],
      },
      kubernetes: {
        title: 'Kubernetes skill roadmap',
        subtitle: 'Orchestrate containers for resilient, scalable systems.',
        steps: [
          {
            title: 'Kubernetes concepts',
            body:
              'Understand clusters, nodes, pods, deployments, and services at a conceptual level.',
          },
          {
            title: 'Deploying simple apps',
            body:
              'Write basic manifests to deploy a stateless application and expose it via a service.',
          },
          {
            title: 'Configuration and scaling',
            body:
              'Use ConfigMaps, Secrets, and horizontal scaling to adapt your app to different loads.',
          },
          {
            title: 'Observability and operations',
            body:
              'Learn how to inspect resources, view logs, and reason about the health of your cluster.',
          },
        ],
      },
    },
  };

  const typeDefinitions = DEFINITIONS[type] || DEFINITIONS.role;
  const fallbackKey = type === 'skill' ? 'python' : 'frontend';
  const roadmap = typeDefinitions[key] || typeDefinitions[fallbackKey];

  const titleEl = document.getElementById('roadmap-detail-title');
  const subtitleEl = document.getElementById('roadmap-detail-subtitle');

  if (titleEl && roadmap.title) {
    titleEl.textContent = roadmap.title;
  }
  if (subtitleEl && roadmap.subtitle) {
    subtitleEl.textContent = roadmap.subtitle;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'card roadmap-path';

  roadmap.steps.forEach((step, index) => {
    const stepEl = document.createElement('article');
    stepEl.className = 'roadmap-step';
    stepEl.innerHTML = `
      <p class="roadmap-step__meta">Step ${index + 1}</p>
      <h3 class="roadmap-step__title">${step.title}</h3>
      <div class="roadmap-step__body">
        <p>${step.body}</p>
      </div>
    `;

    stepEl.addEventListener('click', () => {
      const isOpen = stepEl.classList.contains('is-open');
      $all('.roadmap-step', wrapper).forEach((el) => el.classList.remove('is-open'));
      if (!isOpen) {
        stepEl.classList.add('is-open');
      }
    });

    wrapper.appendChild(stepEl);
  });

  container.innerHTML = '';
  container.appendChild(wrapper);

  const first = $('.roadmap-step', wrapper);
  if (first) first.classList.add('is-open');
})();

// Dynamic topic page: load topic data from topics.json and render by slug
(function initDynamicTopicPage() {
  const root = document.getElementById('topic-root');
  if (!root) return; // Not on the dynamic topic page

  const titleEl = $('#topic-title');
  const summaryEl = $('#topic-summary');
  const fieldEl = $('#topic-field');
  const fieldLabelEl = $('#topic-field-label');
  const breadcrumbTitleEl = $('#topic-title-breadcrumb');
  const mediaEl = $('#topic-media');
  const sectionsEl = $('#topic-sections');
  const quizEl = $('#topic-quiz');
  const relatedEl = $('#topic-related');
  const statusEl = $('#topic-status');

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  const slug = getParam('slug');

  if (!slug) {
    if (statusEl) {
      statusEl.textContent = 'No topic specified. Try visiting this page with ?slug=dna-replication.';
    }
    return;
  }

  if (statusEl) {
    statusEl.textContent = 'Loading topic data...';
  }

  function renderTopic(topic, topicsBySlug) {
    if (titleEl) {
      titleEl.textContent = topic.title;
    }
    if (breadcrumbTitleEl) {
      breadcrumbTitleEl.textContent = topic.title;
    }
    if (fieldEl) {
      fieldEl.textContent = topic.field || '';
    }
    if (fieldLabelEl) {
      fieldLabelEl.textContent = topic.field || 'Topic';
    }
    if (summaryEl) {
      summaryEl.textContent = topic.summary || '';
    }

    // Media: embed video if available, otherwise show a friendly placeholder
    if (mediaEl) {
      mediaEl.innerHTML = '';
      if (topic.videoUrl) {
        const wrapper = document.createElement('div');
        wrapper.className = 'video-placeholder';

        const label = document.createElement('p');
        label.className = 'video-placeholder__label';
        label.textContent = 'Video lesson';

        const frame = document.createElement('iframe');
        frame.src = topic.videoUrl;
        frame.title = topic.title;
        frame.loading = 'lazy';
        frame.setAttribute('allowfullscreen', 'true');
        frame.style.width = '100%';
        frame.style.minHeight = '260px';

        wrapper.appendChild(label);
        wrapper.appendChild(frame);
        mediaEl.appendChild(wrapper);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'video-placeholder';

        const label = document.createElement('p');
        label.className = 'video-placeholder__label';
        label.textContent = 'Video lesson';

        const text = document.createElement('p');
        text.className = 'video-placeholder__text';
        text.textContent = 'A short video or animation for this topic will appear here in the future.';

        placeholder.appendChild(label);
        placeholder.appendChild(text);
        mediaEl.appendChild(placeholder);
      }
    }

    // Sections
    if (sectionsEl) {
      sectionsEl.innerHTML = '';
      const sections = Array.isArray(topic.sections) ? topic.sections : [];

      sections.forEach((section) => {
        const article = document.createElement('article');
        article.className = 'lesson-section';
        if (section.id) {
          article.id = section.id;
        }

        if (section.title) {
          const h3 = document.createElement('h3');
          h3.textContent = section.title;
          article.appendChild(h3);
        }

        const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
        paragraphs.forEach((text) => {
          const p = document.createElement('p');
          p.textContent = text;
          article.appendChild(p);
        });

        sectionsEl.appendChild(article);
      });
    }

    // Quiz (optional)
    const quiz = topic.quiz;
    if (quiz && quizEl) {
      quizEl.innerHTML = '';

      const title = document.createElement('h2');
      title.textContent = quiz.title || 'Quick quiz';
      quizEl.appendChild(title);

      const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

      questions.forEach((q) => {
        const block = document.createElement('div');
        block.className = 'lesson-section';

        const prompt = document.createElement('p');
        prompt.textContent = q.prompt;
        block.appendChild(prompt);

        const list = document.createElement('ul');
        list.className = 'quiz-options';

        const options = Array.isArray(q.options) ? q.options : [];

        options.forEach((optionText, optionIndex) => {
          const li = document.createElement('li');

          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'quiz-option';
          button.textContent = optionText;

          button.addEventListener('click', () => {
            // Clear previous state for this question
            $all('.quiz-option', list).forEach((btn) => {
              btn.classList.remove('is-correct', 'is-incorrect');
            });

            if (optionIndex === q.correctIndex) {
              button.classList.add('is-correct');
            } else {
              button.classList.add('is-incorrect');
            }
          });

          li.appendChild(button);
          list.appendChild(li);
        });

        block.appendChild(list);

        if (q.explanation) {
          const explanation = document.createElement('p');
          explanation.className = 'muted quiz-explanation';
          explanation.textContent = q.explanation;
          block.appendChild(explanation);
        }

        quizEl.appendChild(block);
      });

      quizEl.hidden = questions.length === 0;
    } else if (quizEl) {
      quizEl.hidden = true;
    }

    // Related topics
    const relatedSlugs = Array.isArray(topic.related) ? topic.related : [];
    if (relatedSlugs.length && relatedEl) {
      relatedEl.innerHTML = '';

      const heading = document.createElement('h2');
      heading.textContent = 'Related topics';
      relatedEl.appendChild(heading);

      const row = document.createElement('div');
      row.className = 'pill-row';

      relatedSlugs.forEach((relatedSlug) => {
        const relatedTopic = topicsBySlug[relatedSlug];
        const label = relatedTopic ? relatedTopic.title : relatedSlug;

        const link = document.createElement('a');
        link.href = `topic.html?slug=${encodeURIComponent(relatedSlug)}`;
        link.className = 'pill';
        link.textContent = label;

        row.appendChild(link);
      });

      relatedEl.appendChild(row);
      relatedEl.hidden = false;
    } else if (relatedEl) {
      relatedEl.hidden = true;
    }

    if (statusEl) {
      statusEl.textContent = '';
    }
  }

  fetch('topics.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      const topics = Array.isArray(data.topics) ? data.topics : [];
      const topicsBySlug = topics.reduce((map, t) => {
        if (t && t.slug) {
          map[t.slug] = t;
        }
        return map;
      }, {});

      const topic = topicsBySlug[slug];

      if (!topic) {
        if (statusEl) {
          statusEl.textContent = 'Topic not found. Check the slug in the URL.';
        }
        return;
      }

      renderTopic(topic, topicsBySlug);
    })
    .catch((error) => {
      console.error('Error loading topics.json', error);
      if (statusEl) {
        statusEl.textContent = 'Unable to load topic data. Please try again later.';
      }
    });
})();

// DNA Replication lesson: expandable step sections
(function initDnaReplicationLesson() {
  // Look for step cards on the page. If there are none, do nothing.
  const steps = $all('.lesson-step');
  if (!steps.length) return;

  // Helper to close all step bodies
  function closeAllSteps() {
    steps.forEach(function (step) {
      const body = $('.lesson-step__body', step);
      if (body) {
        body.hidden = true;
      }
      step.classList.remove('is-open');
    });
  }

  // Set up each step card
  steps.forEach(function (step) {
    const header = $('.lesson-step__header', step);
    const body = $('.lesson-step__body', step);
    if (!header || !body) return;

    // Start with all step bodies hidden
    body.hidden = true;

    header.addEventListener('click', function () {
      const isOpen = step.classList.contains('is-open');

      // Always close everything first
      closeAllSteps();

      // If this one was not open, open it now
      if (!isOpen) {
        body.hidden = false;
        step.classList.add('is-open');
      }
    });
  });

  // Optionally open the first step by default so the page feels alive
  const firstStep = steps[0];
  if (firstStep) {
    const firstBody = $('.lesson-step__body', firstStep);
    if (firstBody) {
      firstBody.hidden = false;
      firstStep.classList.add('is-open');
    }
  }
})();

// Forces & Motion lesson: simple net force demo
(function initForcesMotionDemo() {
  const rightButton = document.getElementById('force-right');
  const leftButton = document.getElementById('force-left');
  const output = document.getElementById('net-force-output');

  // If these elements are not on the page, do nothing.
  if (!rightButton || !leftButton || !output) return;

  // We will treat forces to the right as positive, and to the left as negative.
  let netForce = 0;

  function renderNetForce() {
    let directionText;
    if (netForce > 0) {
      directionText = 'to the right';
    } else if (netForce < 0) {
      directionText = 'to the left';
    } else {
      directionText = 'balanced';
    }

    output.textContent = 'Net force: ' + netForce + ' (' + directionText + ')';
  }

  rightButton.addEventListener('click', function () {
    netForce += 1;
    renderNetForce();
  });

  leftButton.addEventListener('click', function () {
    netForce -= 1;
    renderNetForce();
  });

  // Show the starting value
  renderNetForce();
})();

// Time & Space Complexity lesson: clickable examples
(function initComplexityExamples() {
  // Find the example buttons and the output paragraph.
  const cards = $all('.complexity-card');
  const output = document.getElementById('complexity-output');

  if (!cards.length || !output) return; // Not on the complexity page

  function getExplanation(label) {
    if (label === 'O(1)') {
      return 'O(1) means constant time: the work stays about the same, no matter how big the input is.';
    }
    if (label === 'O(n)') {
      return 'O(n) means linear time: if you double the input size, the work roughly doubles as well.';
    }
    if (label === 'O(n^2)') {
      return 'O(n^2) means quadratic time: if you double the input size, the work can grow by about four times.';
    }
    return 'This is an example of how an algorithm\'s work can grow as the input grows.';
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      const label = card.getAttribute('data-complexity');
      const message = getExplanation(label);
      output.textContent = label + ': ' + message;
    });
  });
})();


