// Initialize panzoom on Mermaid diagrams after they render
(function() {
  'use strict';

  let initAttempts = 0;
  const MAX_ATTEMPTS = 30;

  // Wait for panzoom to be available
  function waitForPanzoom(callback) {
    if (typeof panzoom !== 'undefined') {
      callback();
    } else if (initAttempts < MAX_ATTEMPTS) {
      initAttempts++;
      setTimeout(function() {
        waitForPanzoom(callback);
      }, 200);
    } else {
      console.warn('panzoom library not found after multiple attempts');
    }
  }

  // Initialize panzoom on a single diagram
  function initPanzoomOnDiagram(diagram) {
    // Skip if already initialized
    if (diagram.hasAttribute('data-mermaid-panzoom-initialized')) {
      return;
    }

    // Skip if diagram doesn't have an SVG yet (Mermaid still rendering)
    const svg = diagram.querySelector('svg');
    if (!svg) {
      return;
    }

    // Mark as initialized
    diagram.setAttribute('data-mermaid-panzoom-initialized', 'true');

    // Initialize panzoom on the diagram
    try {
      const instance = panzoom(diagram, {
        smoothScroll: false,
        minZoom: 0.3,
        maxZoom: 4,
        zoomSpeed: 0.15,
        filterKey: function() {
          // Only handle Alt key
          return true;
        }
      });

      // Store instance for later access
      diagram._panzoomInstance = instance;

      // Add visual hint
      addPanzoomHint(diagram);
    } catch (e) {
      console.warn('Failed to initialize panzoom on diagram:', e);
    }
  }

  // Initialize panzoom on all Mermaid diagrams
  function initPanzoomForMermaid() {
    const mermaidDiagrams = document.querySelectorAll('.mermaid');
    let initialized = 0;

    mermaidDiagrams.forEach(function(diagram) {
      if (!diagram.hasAttribute('data-mermaid-panzoom-initialized')) {
        const svg = diagram.querySelector('svg');
        if (svg) {
          initPanzoomOnDiagram(diagram);
          initialized++;
        }
      }
    });

    return initialized;
  }

  // Add a subtle hint about panzoom controls
  function addPanzoomHint(diagram) {
    // Check if hint already exists
    if (diagram.querySelector('.mermaid-panzoom-hint')) {
      return;
    }

    const hint = document.createElement('div');
    hint.className = 'mermaid-panzoom-hint';
    hint.textContent = 'Alt + scroll/drag to zoom';
    hint.setAttribute('aria-hidden', 'true');

    Object.assign(hint.style, {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      background: 'rgba(0, 0, 0, 0.75)',
      color: 'white',
      padding: '6px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      zIndex: '10',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    // Ensure diagram has position relative
    const computedStyle = window.getComputedStyle(diagram);
    if (computedStyle.position === 'static') {
      diagram.style.position = 'relative';
    }

    diagram.appendChild(hint);

    // Show hint on hover
    diagram.addEventListener('mouseenter', function() {
      hint.style.opacity = '0.85';
    });

    diagram.addEventListener('mouseleave', function() {
      hint.style.opacity = '0';
    });
  }

  // Watch for dynamically added Mermaid diagrams
  function setupMutationObserver() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            // Check if the added node is a Mermaid diagram
            if (node.classList && node.classList.contains('mermaid')) {
              waitForPanzoom(function() {
                initPanzoomOnDiagram(node);
              });
            }
            // Check if the added node contains Mermaid diagrams
            const diagrams = node.querySelectorAll ? node.querySelectorAll('.mermaid') : [];
              diagrams.forEach(function(diagram) {
                waitForPanzoom(function() {
                  initPanzoomOnDiagram(diagram);
                });
              });
          }
        });
      });
    });

    // Start observing the document body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  // Main initialization
  function main() {
    waitForPanzoom(function() {
      // Initialize existing diagrams
      initPanzoomForMermaid();

      // Set up observer for dynamic diagrams
      setupMutationObserver();

      // Also try at intervals for slow-rendering diagrams
      let retryCount = 0;
      const retryInterval = setInterval(function() {
        const newDiagrams = initPanzoomForMermaid();
        if (newDiagrams === 0) {
          retryCount++;
          if (retryCount >= 10) {
            clearInterval(retryInterval);
          }
        } else {
          retryCount = 0; // Reset if we found new diagrams
        }
      }, 500);
    });
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
