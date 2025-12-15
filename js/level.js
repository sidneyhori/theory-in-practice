// Level Switcher - Audience Level Management

(function() {
  const STORAGE_KEY = 'tip-level';

  const LEVELS = {
    'middle-school': {
      id: 'middle-school',
      label: 'Middle School',
      shortLabel: 'MS',
      description: 'Everyday examples, games, stories'
    },
    'high-school': {
      id: 'high-school',
      label: 'High School',
      shortLabel: 'HS',
      description: 'More math, real-world applications'
    },
    'college': {
      id: 'college',
      label: 'College',
      shortLabel: 'College',
      description: 'Formal definitions, proofs, formulas'
    },
    'professional': {
      id: 'professional',
      label: 'Professional',
      shortLabel: 'Pro',
      description: 'Advanced applications, research context'
    }
  };

  const DEFAULT_LEVEL = 'high-school';

  // Get current level from storage or default
  function getLevel() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LEVELS[stored]) return stored;
    return DEFAULT_LEVEL;
  }

  // Set level and update UI
  function setLevel(levelId) {
    if (!LEVELS[levelId]) return;

    localStorage.setItem(STORAGE_KEY, levelId);
    document.documentElement.setAttribute('data-level', levelId);

    updateUI(levelId);

    // Dispatch custom event for content pages to listen
    window.dispatchEvent(new CustomEvent('levelchange', {
      detail: { level: levelId, levelData: LEVELS[levelId] }
    }));
  }

  // Update all level switcher UIs
  function updateUI(levelId) {
    // Update desktop level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === levelId);
    });

    // Update mobile dropdown
    const dropdownBtn = document.querySelector('.level-dropdown-btn span');
    if (dropdownBtn) {
      dropdownBtn.textContent = LEVELS[levelId].label;
    }

    document.querySelectorAll('.level-dropdown-item').forEach(item => {
      item.classList.toggle('active', item.dataset.level === levelId);
    });
  }

  // Initialize level system
  function init() {
    const level = getLevel();
    document.documentElement.setAttribute('data-level', level);

    // Wait for DOM then update UI and set up listeners
    function setup() {
      updateUI(level);

      // Desktop level buttons
      document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          setLevel(btn.dataset.level);
        });
      });

      // Mobile dropdown toggle
      const dropdown = document.querySelector('.level-dropdown');
      const dropdownBtn = document.querySelector('.level-dropdown-btn');

      if (dropdown && dropdownBtn) {
        dropdownBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
          dropdown.classList.remove('open');
        });

        // Dropdown items
        document.querySelectorAll('.level-dropdown-item').forEach(item => {
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            setLevel(item.dataset.level);
            dropdown.classList.remove('open');
          });
        });
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  init();

  // Expose for external use
  window.TIP = window.TIP || {};
  window.TIP.level = {
    get: getLevel,
    set: setLevel,
    levels: LEVELS
  };
})();
