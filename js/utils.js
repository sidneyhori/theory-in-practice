// Utility Functions for Theory in Practice

(function() {
  window.TIP = window.TIP || {};

  // Debounce function for performance
  window.TIP.debounce = function(fn, delay = 250) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  // Throttle function for scroll events
  window.TIP.throttle = function(fn, limit = 250) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Generate unique ID
  window.TIP.uid = function(prefix = 'tip') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Clamp number between min and max
  window.TIP.clamp = function(num, min, max) {
    return Math.min(Math.max(num, min), max);
  };

  // Linear interpolation
  window.TIP.lerp = function(start, end, t) {
    return start + (end - start) * t;
  };

  // Map value from one range to another
  window.TIP.mapRange = function(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  };

  // Format number with locale
  window.TIP.formatNumber = function(num, decimals = 0) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Check if element is in viewport
  window.TIP.isInViewport = function(el, offset = 0) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= -offset &&
      rect.left >= -offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  };

  // Simple animation helper using requestAnimationFrame
  window.TIP.animate = function(from, to, duration, callback, easing = t => t) {
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const current = from + (to - from) * easedProgress;

      callback(current, progress);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  };

  // Easing functions
  window.TIP.easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  };
})();
