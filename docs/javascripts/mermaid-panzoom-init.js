// Initialize panzoom on Mermaid diagrams after they render
// This script must load AFTER both panzoom and mermaid are ready
(function() {
  'use strict';

  function initPanzoomOnMermaid() {
    const mermaidDiagrams = document.querySelectorAll('.mermaid');

    mermaidDiagrams.forEach(function(diagram) {
      // Skip if already initialized by the panzoom plugin
      if (diagram.classList.contains('panzoom-enabled')) {
        return;
      }

      // Check if SVG exists (Mermaid has rendered)
      const svg = diagram.querySelector('svg');
      if (!svg) {
        return; // Mermaid not yet rendered
      }

      try {
        // Initialize panzoom
        panzoom(diagram, {
          smoothScroll: false,
          minZoom: 0.3,
          maxZoom: 4,
          zoomSpeed: 0.15
        });

        // Add visual hint
        addHint(diagram);

        // Mark as enabled
        diagram.classList.add('panzoom-enabled');
      } catch (e) {
        console.warn('Failed to initialize panzoom:', e);
      }
    });
  }

  function addHint(diagram) {
    // Skip if hint already exists
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

  // Wait for both panzoom and DOM to be ready
  function whenReady(callback) {
    let attempts = 0;
    const maxAttempts = 50;

    function check() {
      attempts++;

      // Check if panzoom is loaded and DOM is ready
      if (typeof panzoom !== 'undefined' && document.readyState === 'complete') {
        callback();
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(check, 200);
      }
    }

    check();
  }

  // Start initialization
  whenReady(function() {
    // Initial initialization
    initPanzoomOnMermaid();

    // Set up MutationObserver for dynamically rendered Mermaid diagrams
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.classList && node.classList.contains('mermaid')) {
              initPanzoomOnMermaid();
            }
            const diagrams = node.querySelectorAll ? node.querySelectorAll('.mermaid') : [];
            if (diagrams.length > 0) {
              initPanzoomOnMermaid();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also poll for a while to catch slow-rendering diagrams
    let pollCount = 0;
    const pollInterval = setInterval(function() {
      pollCount++;
      initPanzoomOnMermaid();
      if (pollCount >= 20) { // Stop after ~10 seconds
        clearInterval(pollInterval);
      }
    }, 500);
  });
})();
