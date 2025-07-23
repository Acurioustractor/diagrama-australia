/**
 * SCROLLYTELLING ENGINE
 * 
 * Core engine for scroll-based storytelling using Intersection Observer API
 * Handles section detection, progress tracking, and animation triggers
 */

export class ScrollytellingEngine {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 0.2,
      debounce: options.debounce || 16,
      rootMargin: options.rootMargin || '0px',
      ...options
    };
    
    this.sections = new Map();
    this.currentSection = null;
    this.scrollProgress = 0;
    this.isScrolling = false;
    this.observers = new Map();
    this.callbacks = new Map();
    
    // Bind methods
    this.handleIntersection = this.handleIntersection.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
  }
  
  /**
   * Initialize the scrollytelling engine
   */
  async init() {
    try {
      // Discover and register sections
      await this.discoverSections();
      
      // Set up intersection observers
      this.setupIntersectionObservers();
      
      // Set up scroll listeners
      this.setupScrollListeners();
      
      // Initial progress calculation
      this.updateProgress();
      
      console.log(`ScrollytellingEngine initialized with ${this.sections.size} sections`);
      
    } catch (error) {
      console.error('Failed to initialize ScrollytellingEngine:', error);
      throw error;
    }
  }
  
  /**
   * Discover all story sections in the DOM
   */
  async discoverSections() {
    const sectionElements = document.querySelectorAll('.story-section');
    
    sectionElements.forEach((element, index) => {
      const sectionData = {
        id: element.id || `section-${index}`,
        element: element,
        type: element.dataset.sectionType || 'default',
        index: index,
        isVisible: false,
        visibilityRatio: 0,
        animations: this.discoverSectionAnimations(element),
        media: this.discoverSectionMedia(element),
        bounds: null
      };
      
      this.sections.set(sectionData.id, sectionData);
    });
    
    // Calculate initial bounds
    this.updateSectionBounds();
  }
  
  /**
   * Discover animations within a section
   */
  discoverSectionAnimations(element) {
    const animations = [];
    const animatedElements = element.querySelectorAll('[data-animate]');
    
    animatedElements.forEach((el, index) => {
      const animationType = el.dataset.animate;
      const delay = parseFloat(el.dataset.animateDelay) || index * 0.1;
      const duration = parseFloat(el.dataset.animateDuration) || 0.8;
      
      animations.push({
        element: el,
        type: animationType,
        delay: delay,
        duration: duration,
        triggered: false
      });
    });
    
    return animations;
  }
  
  /**
   * Discover media elements within a section
   */
  discoverSectionMedia(element) {
    const media = {
      images: Array.from(element.querySelectorAll('img[data-src], img[loading="lazy"]')),
      videos: Array.from(element.querySelectorAll('video')),
      backgrounds: Array.from(element.querySelectorAll('.background-image, .hero-video'))
    };
    
    return media;
  }
  
  /**
   * Set up intersection observers for sections
   */
  setupIntersectionObservers() {
    // Main section observer
    const sectionObserver = new IntersectionObserver(
      this.handleIntersection,
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        rootMargin: this.options.rootMargin
      }
    );
    
    // Animation trigger observer (more sensitive)
    const animationObserver = new IntersectionObserver(
      this.handleAnimationTrigger.bind(this),
      {
        threshold: this.options.threshold,
        rootMargin: '50px'
      }
    );
    
    // Observe all sections
    this.sections.forEach((section) => {
      sectionObserver.observe(section.element);
      animationObserver.observe(section.element);
    });
    
    this.observers.set('sections', sectionObserver);
    this.observers.set('animations', animationObserver);
  }
  
  /**
   * Set up scroll event listeners
   */
  setupScrollListeners() {
    let scrollTimeout;
    
    const debouncedScroll = () => {
      if (!this.isScrolling) {
        this.isScrolling = true;
        this.emit('scrollStart');
      }
      
      this.handleScroll();
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.emit('scrollEnd');
      }, 150);
    };
    
    // Use passive listeners for better performance
    window.addEventListener('scroll', debouncedScroll, { passive: true });
    
    // Store reference for cleanup
    this.scrollListener = debouncedScroll;
  }
  
  /**
   * Handle intersection observer callbacks
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      const sectionId = entry.target.id || entry.target.dataset.sectionId;
      const section = this.sections.get(sectionId);
      
      if (!section) return;
      
      // Update section visibility
      section.isVisible = entry.isIntersecting;
      section.visibilityRatio = entry.intersectionRatio;
      
      // Update current section based on highest visibility ratio
      this.updateCurrentSection();
      
      // Emit section events
      if (entry.isIntersecting) {
        this.emit('sectionEnter', section);
      } else {
        this.emit('sectionLeave', section);
      }
      
      // Handle section-specific logic
      this.handleSectionVisibility(section, entry);
    });
  }
  
  /**
   * Handle animation trigger intersections
   */
  handleAnimationTrigger(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id || entry.target.dataset.sectionId;
        const section = this.sections.get(sectionId);
        
        if (section && section.animations.length > 0) {
          this.triggerSectionAnimations(section);
        }
      }
    });
  }
  
  /**
   * Update current section based on visibility
   */
  updateCurrentSection() {
    let maxVisibility = 0;
    let newCurrentSection = null;
    
    this.sections.forEach(section => {
      if (section.isVisible && section.visibilityRatio > maxVisibility) {
        maxVisibility = section.visibilityRatio;
        newCurrentSection = section;
      }
    });
    
    if (newCurrentSection && newCurrentSection !== this.currentSection) {
      const previousSection = this.currentSection;
      this.currentSection = newCurrentSection;
      
      this.emit('sectionChange', {
        current: newCurrentSection,
        previous: previousSection
      });
    }
  }
  
  /**
   * Handle section visibility changes
   */
  handleSectionVisibility(section, entry) {
    // Section-specific handling based on type
    switch (section.type) {
      case 'hero':
        this.handleHeroSection(section, entry);
        break;
      case 'crisis':
        this.handleCrisisSection(section, entry);
        break;
      case 'solution':
        this.handleSolutionSection(section, entry);
        break;
      case 'timeline':
        this.handleTimelineSection(section, entry);
        break;
      case 'investment':
        this.handleInvestmentSection(section, entry);
        break;
      default:
        this.handleDefaultSection(section, entry);
    }
  }
  
  /**
   * Handle hero section visibility
   */
  handleHeroSection(section, entry) {
    if (entry.isIntersecting) {
      // Start hero video if present
      const video = section.element.querySelector('.hero-video');
      if (video && video.paused) {
        video.play().catch(console.warn);
      }
    }
  }
  
  /**
   * Handle crisis section visibility
   */
  handleCrisisSection(section, entry) {
    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
      // Trigger counter animations
      this.triggerCounterAnimations(section);
    }
  }
  
  /**
   * Handle solution section visibility
   */
  handleSolutionSection(section, entry) {
    if (entry.isIntersecting) {
      // Trigger comparison reveal
      this.triggerComparisonAnimation(section);
    }
  }
  
  /**
   * Handle timeline section visibility
   */
  handleTimelineSection(section, entry) {
    if (entry.isIntersecting) {
      // Trigger timeline item animations
      this.triggerTimelineAnimations(section);
    }
  }
  
  /**
   * Handle investment section visibility
   */
  handleInvestmentSection(section, entry) {
    if (entry.isIntersecting) {
      // Trigger tier animations
      this.triggerTierAnimations(section);
    }
  }
  
  /**
   * Handle default section visibility
   */
  handleDefaultSection(section, entry) {
    // Default behavior for sections without specific handling
    if (entry.isIntersecting) {
      this.triggerSectionAnimations(section);
    }
  }
  
  /**
   * Trigger animations for a section
   */
  triggerSectionAnimations(section) {
    section.animations.forEach((animation, index) => {
      if (!animation.triggered) {
        setTimeout(() => {
          this.triggerAnimation(animation);
        }, animation.delay * 1000);
        
        animation.triggered = true;
      }
    });
  }
  
  /**
   * Trigger a specific animation
   */
  triggerAnimation(animation) {
    const element = animation.element;
    const type = animation.type;
    
    // Add animation class based on type
    switch (type) {
      case 'fade-up':
        element.classList.add('fade-up', 'visible');
        break;
      case 'slide-up':
        element.classList.add('slide-up', 'visible');
        break;
      case 'slide-left':
        element.classList.add('slide-left', 'visible');
        break;
      case 'slide-right':
        element.classList.add('slide-right', 'visible');
        break;
      case 'scale-in':
        element.classList.add('scale-in', 'visible');
        break;
      case 'counter':
        this.animateCounter(element);
        break;
      case 'timeline':
        element.classList.add('timeline-item', 'visible');
        break;
      case 'reveal':
        this.triggerRevealAnimation(element);
        break;
      default:
        element.classList.add('fade-in', 'visible');
    }
    
    this.emit('animationTriggered', { animation, element });
  }
  
  /**
   * Animate counter elements
   */
  animateCounter(element) {
    const target = parseInt(element.dataset.target) || 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
      
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target;
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * Trigger comparison reveal animation
   */
  triggerComparisonAnimation(section) {
    const before = section.element.querySelector('.comparison-before');
    const after = section.element.querySelector('.comparison-after');
    const arrow = section.element.querySelector('.comparison-arrow');
    
    if (before) {
      setTimeout(() => before.classList.add('visible'), 0);
    }
    if (arrow) {
      setTimeout(() => arrow.classList.add('visible'), 300);
    }
    if (after) {
      setTimeout(() => after.classList.add('visible'), 600);
    }
  }
  
  /**
   * Trigger counter animations for crisis section
   */
  triggerCounterAnimations(section) {
    const counters = section.element.querySelectorAll('[data-target]');
    counters.forEach((counter, index) => {
      setTimeout(() => {
        this.animateCounter(counter);
      }, index * 200);
    });
  }
  
  /**
   * Trigger timeline animations
   */
  triggerTimelineAnimations(section) {
    const timelineItems = section.element.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 300);
    });
  }
  
  /**
   * Trigger tier animations
   */
  triggerTierAnimations(section) {
    const tiers = section.element.querySelectorAll('.tier-item');
    tiers.forEach((tier, index) => {
      setTimeout(() => {
        tier.classList.add('slide-up', 'visible');
      }, index * 200);
    });
  }
  
  /**
   * Trigger reveal animation
   */
  triggerRevealAnimation(element) {
    const children = element.children;
    Array.from(children).forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('fade-up', 'visible');
      }, index * 100);
    });
  }
  
  /**
   * Handle scroll events
   */
  handleScroll() {
    this.updateProgress();
    this.updateSectionBounds();
    
    // Emit scroll progress
    this.emit('scroll', {
      progress: this.scrollProgress,
      currentSection: this.currentSection
    });
  }
  
  /**
   * Update scroll progress
   */
  updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    this.scrollProgress = Math.min(scrollTop / scrollHeight, 1);
    
    // Update progress indicator
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${this.scrollProgress * 100}%`;
    }
  }
  
  /**
   * Update section bounds
   */
  updateSectionBounds() {
    this.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      section.bounds = {
        top: rect.top + window.pageYOffset,
        bottom: rect.bottom + window.pageYOffset,
        height: rect.height
      };
    });
  }
  
  /**
   * Navigate to a specific section
   */
  navigateToSection(sectionId) {
    const section = this.sections.get(sectionId);
    if (!section) {
      console.warn(`Section ${sectionId} not found`);
      return;
    }
    
    section.element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    this.emit('navigationTriggered', section);
  }
  
  /**
   * Get current section
   */
  getCurrentSection() {
    return this.currentSection;
  }
  
  /**
   * Get all sections
   */
  getSections() {
    return Array.from(this.sections.values());
  }
  
  /**
   * Get scroll progress
   */
  getScrollProgress() {
    return this.scrollProgress;
  }
  
  /**
   * Event system
   */
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }
  
  off(event, callback) {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  emit(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    // Recalculate section bounds
    this.updateSectionBounds();
    
    // Update progress
    this.updateProgress();
    
    this.emit('resize');
  }
  
  /**
   * Start the engine
   */
  start() {
    // Initial trigger for visible sections
    this.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        this.triggerSectionAnimations(section);
      }
    });
  }
  
  /**
   * Destroy the engine
   */
  destroy() {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Remove scroll listener
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    
    // Clear callbacks
    this.callbacks.clear();
    
    // Clear sections
    this.sections.clear();
    
    console.log('ScrollytellingEngine destroyed');
  }
}