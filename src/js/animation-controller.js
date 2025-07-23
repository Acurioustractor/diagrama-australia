/**
 * ANIMATION CONTROLLER
 * 
 * Handles all animations using GSAP for smooth, performant effects
 * Manages animation timelines, sequences, and performance optimization
 */

export class AnimationController {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 0.8,
      easing: options.easing || 'power2.out',
      stagger: options.stagger || 0.1,
      respectReducedMotion: options.respectReducedMotion !== false,
      ...options
    };
    
    this.timelines = new Map();
    this.animations = new Map();
    this.isGSAPLoaded = false;
    this.reducedMotion = false;
    
    // Check for reduced motion preference
    this.checkReducedMotion();
  }
  
  /**
   * Initialize the animation controller
   */
  async init() {
    try {
      // Load GSAP if not already loaded
      await this.loadGSAP();
      
      // Set up GSAP defaults
      this.setupGSAPDefaults();
      
      // Set up media query listener for reduced motion
      this.setupReducedMotionListener();
      
      console.log('AnimationController initialized');
      
    } catch (error) {
      console.error('Failed to initialize AnimationController:', error);
      // Fallback to CSS animations
      this.setupCSSFallback();
    }
  }
  
  /**
   * Load GSAP library
   */
  async loadGSAP() {
    // Check if GSAP is already loaded
    if (window.gsap) {
      this.isGSAPLoaded = true;
      return;
    }
    
    try {
      // Try to import GSAP from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = () => {
          this.isGSAPLoaded = true;
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
    } catch (error) {
      console.warn('Failed to load GSAP from CDN, using CSS fallback');
      this.isGSAPLoaded = false;
    }
  }
  
  /**
   * Set up GSAP defaults
   */
  setupGSAPDefaults() {
    if (!this.isGSAPLoaded || !window.gsap) return;
    
    // Set default ease
    window.gsap.defaults({
      duration: this.options.duration,
      ease: this.options.easing
    });
    
    // Register ScrollTrigger if available
    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
  }
  
  /**
   * Check for reduced motion preference
   */
  checkReducedMotion() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = mediaQuery.matches;
    }
  }
  
  /**
   * Set up reduced motion listener
   */
  setupReducedMotionListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addEventListener('change', (e) => {
        this.reducedMotion = e.matches;
        this.handleReducedMotionChange();
      });
    }
  }
  
  /**
   * Handle reduced motion preference changes
   */
  handleReducedMotionChange() {
    if (this.reducedMotion && this.options.respectReducedMotion) {
      // Disable or simplify animations
      this.disableAnimations();
    } else {
      // Re-enable animations
      this.enableAnimations();
    }
  }
  
  /**
   * Set up CSS fallback for when GSAP is not available
   */
  setupCSSFallback() {
    console.log('Using CSS animations as fallback');
    
    // Add CSS fallback class to body
    document.body.classList.add('css-animations-fallback');
    
    // Create fallback animation styles
    const style = document.createElement('style');
    style.textContent = `
      .css-animations-fallback .fade-up {
        transition: all 0.8s ease-out;
      }
      .css-animations-fallback .slide-up {
        transition: all 0.8s ease-out;
      }
      .css-animations-fallback .scale-in {
        transition: all 0.8s ease-out;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Create a timeline for complex animations
   */
  createTimeline(id, options = {}) {
    if (!this.isGSAPLoaded || !window.gsap) {
      return this.createCSSTimeline(id, options);
    }
    
    const timeline = window.gsap.timeline({
      paused: true,
      ...options
    });
    
    this.timelines.set(id, timeline);
    return timeline;
  }
  
  /**
   * Create CSS-based timeline fallback
   */
  createCSSTimeline(id, options = {}) {
    const timeline = {
      elements: [],
      delays: [],
      play: () => this.playCSSTimeline(id),
      pause: () => this.pauseCSSTimeline(id),
      reverse: () => this.reverseCSSTimeline(id),
      to: (element, duration, properties) => {
        this.addCSSAnimation(id, element, properties);
        return timeline;
      }
    };
    
    this.timelines.set(id, timeline);
    return timeline;
  }
  
  /**
   * Animate element entrance
   */
  animateIn(element, type = 'fadeUp', options = {}) {
    if (this.shouldSkipAnimation()) {
      this.showElementImmediately(element);
      return Promise.resolve();
    }
    
    if (!this.isGSAPLoaded || !window.gsap) {
      return this.animateInCSS(element, type, options);
    }
    
    return this.animateInGSAP(element, type, options);
  }
  
  /**
   * GSAP-based entrance animation
   */
  animateInGSAP(element, type, options = {}) {
    const duration = options.duration || this.options.duration;
    const delay = options.delay || 0;
    const ease = options.ease || this.options.easing;
    
    // Set initial state
    window.gsap.set(element, this.getInitialState(type));
    
    // Animate to final state
    return window.gsap.to(element, {
      ...this.getFinalState(type),
      duration,
      delay,
      ease,
      onComplete: options.onComplete
    });
  }
  
  /**
   * CSS-based entrance animation
   */
  animateInCSS(element, type, options = {}) {
    return new Promise((resolve) => {
      const delay = (options.delay || 0) * 1000;
      
      setTimeout(() => {
        element.classList.add(this.getCSSAnimationClass(type), 'visible');
        
        // Resolve after animation duration
        setTimeout(resolve, (options.duration || this.options.duration) * 1000);
      }, delay);
    });
  }
  
  /**
   * Get initial state for animation type
   */
  getInitialState(type) {
    const states = {
      fadeUp: { opacity: 0, y: 30 },
      fadeDown: { opacity: 0, y: -30 },
      fadeLeft: { opacity: 0, x: 30 },
      fadeRight: { opacity: 0, x: -30 },
      scaleIn: { opacity: 0, scale: 0.8 },
      slideUp: { opacity: 0, y: 50 },
      slideDown: { opacity: 0, y: -50 },
      slideLeft: { opacity: 0, x: 50 },
      slideRight: { opacity: 0, x: -50 }
    };
    
    return states[type] || states.fadeUp;
  }
  
  /**
   * Get final state for animation type
   */
  getFinalState(type) {
    return {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1
    };
  }
  
  /**
   * Get CSS animation class for type
   */
  getCSSAnimationClass(type) {
    const classes = {
      fadeUp: 'fade-up',
      fadeDown: 'fade-down',
      fadeLeft: 'fade-left',
      fadeRight: 'fade-right',
      scaleIn: 'scale-in',
      slideUp: 'slide-up',
      slideDown: 'slide-down',
      slideLeft: 'slide-left',
      slideRight: 'slide-right'
    };
    
    return classes[type] || 'fade-up';
  }
  
  /**
   * Animate multiple elements with stagger
   */
  animateStagger(elements, type = 'fadeUp', options = {}) {
    if (this.shouldSkipAnimation()) {
      elements.forEach(el => this.showElementImmediately(el));
      return Promise.resolve();
    }
    
    const stagger = options.stagger || this.options.stagger;
    
    if (!this.isGSAPLoaded || !window.gsap) {
      return this.animateStaggerCSS(elements, type, options);
    }
    
    return this.animateStaggerGSAP(elements, type, options);
  }
  
  /**
   * GSAP stagger animation
   */
  animateStaggerGSAP(elements, type, options = {}) {
    const duration = options.duration || this.options.duration;
    const stagger = options.stagger || this.options.stagger;
    const ease = options.ease || this.options.easing;
    
    // Set initial states
    window.gsap.set(elements, this.getInitialState(type));
    
    // Animate with stagger
    return window.gsap.to(elements, {
      ...this.getFinalState(type),
      duration,
      ease,
      stagger: {
        amount: stagger * elements.length,
        from: options.from || 'start'
      },
      onComplete: options.onComplete
    });
  }
  
  /**
   * CSS stagger animation
   */
  animateStaggerCSS(elements, type, options = {}) {
    const stagger = (options.stagger || this.options.stagger) * 1000;
    const promises = [];
    
    elements.forEach((element, index) => {
      const promise = this.animateInCSS(element, type, {
        ...options,
        delay: (options.delay || 0) + (index * stagger / 1000)
      });
      promises.push(promise);
    });
    
    return Promise.all(promises);
  }
  
  /**
   * Animate counter/number
   */
  animateCounter(element, target, options = {}) {
    if (this.shouldSkipAnimation()) {
      element.textContent = target;
      return Promise.resolve();
    }
    
    const duration = options.duration || 2;
    const ease = options.ease || 'power2.out';
    const startValue = options.startValue || 0;
    
    if (!this.isGSAPLoaded || !window.gsap) {
      return this.animateCounterCSS(element, target, options);
    }
    
    const obj = { value: startValue };
    
    return window.gsap.to(obj, {
      value: target,
      duration,
      ease,
      onUpdate: () => {
        const currentValue = Math.floor(obj.value);
        element.textContent = options.formatter ? 
          options.formatter(currentValue) : currentValue;
      },
      onComplete: () => {
        element.textContent = options.formatter ? 
          options.formatter(target) : target;
        if (options.onComplete) options.onComplete();
      }
    });
  }
  
  /**
   * CSS counter animation fallback
   */
  animateCounterCSS(element, target, options = {}) {
    return new Promise((resolve) => {
      const duration = (options.duration || 2) * 1000;
      const startValue = options.startValue || 0;
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
        
        element.textContent = options.formatter ? 
          options.formatter(currentValue) : currentValue;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.textContent = options.formatter ? 
            options.formatter(target) : target;
          if (options.onComplete) options.onComplete();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Create scroll-triggered animation
   */
  createScrollAnimation(element, animation, options = {}) {
    if (!this.isGSAPLoaded || !window.gsap || !window.ScrollTrigger) {
      // Fallback to intersection observer
      return this.createScrollAnimationFallback(element, animation, options);
    }
    
    return window.gsap.to(element, {
      ...animation,
      scrollTrigger: {
        trigger: element,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        toggleActions: options.toggleActions || 'play none none reverse',
        ...options.scrollTrigger
      }
    });
  }
  
  /**
   * Fallback scroll animation using Intersection Observer
   */
  createScrollAnimationFallback(element, animation, options = {}) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateIn(element, 'fadeUp', options);
          observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '50px'
    });
    
    observer.observe(element);
    return observer;
  }
  
  /**
   * Trigger initial animations for visible elements
   */
  triggerInitialAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        const animationType = element.dataset.animate || 'fadeUp';
        const delay = parseFloat(element.dataset.animateDelay) || index * 0.1;
        
        this.animateIn(element, animationType, { delay });
      }
    });
  }
  
  /**
   * Check if animations should be skipped
   */
  shouldSkipAnimation() {
    return this.reducedMotion && this.options.respectReducedMotion;
  }
  
  /**
   * Show element immediately without animation
   */
  showElementImmediately(element) {
    element.style.opacity = '1';
    element.style.transform = 'none';
    element.classList.add('visible');
  }
  
  /**
   * Disable all animations
   */
  disableAnimations() {
    document.body.classList.add('animations-disabled');
    
    // Pause all GSAP animations
    if (this.isGSAPLoaded && window.gsap) {
      window.gsap.globalTimeline.pause();
    }
    
    // Add CSS to disable transitions
    const style = document.createElement('style');
    style.id = 'disable-animations';
    style.textContent = `
      .animations-disabled *,
      .animations-disabled *::before,
      .animations-disabled *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Enable all animations
   */
  enableAnimations() {
    document.body.classList.remove('animations-disabled');
    
    // Resume GSAP animations
    if (this.isGSAPLoaded && window.gsap) {
      window.gsap.globalTimeline.resume();
    }
    
    // Remove disable styles
    const disableStyle = document.getElementById('disable-animations');
    if (disableStyle) {
      disableStyle.remove();
    }
  }
  
  /**
   * Toggle animations on/off
   */
  toggleAnimations(pause = null) {
    const shouldPause = pause !== null ? pause : !this.animationsPaused;
    
    if (shouldPause) {
      this.disableAnimations();
      this.animationsPaused = true;
    } else {
      this.enableAnimations();
      this.animationsPaused = false;
    }
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.options = { ...this.options, ...newConfig };
    
    // Update GSAP defaults if loaded
    if (this.isGSAPLoaded && window.gsap) {
      window.gsap.defaults({
        duration: this.options.duration,
        ease: this.options.easing
      });
    }
  }
  
  /**
   * Get timeline by ID
   */
  getTimeline(id) {
    return this.timelines.get(id);
  }
  
  /**
   * Remove timeline
   */
  removeTimeline(id) {
    const timeline = this.timelines.get(id);
    if (timeline && timeline.kill) {
      timeline.kill();
    }
    this.timelines.delete(id);
  }
  
  /**
   * Clean up and destroy
   */
  destroy() {
    // Kill all timelines
    this.timelines.forEach(timeline => {
      if (timeline && timeline.kill) {
        timeline.kill();
      }
    });
    this.timelines.clear();
    
    // Clear animations
    this.animations.clear();
    
    // Remove event listeners
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.removeEventListener('change', this.handleReducedMotionChange);
    }
    
    console.log('AnimationController destroyed');
  }
}