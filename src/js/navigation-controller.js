/**
 * NAVIGATION CONTROLLER
 * 
 * Handles navigation between sections, keyboard controls, and URL routing
 * Provides smooth transitions and accessibility features
 */

export class NavigationController {
  constructor(options = {}) {
    this.options = {
      keyboardNavigation: options.keyboardNavigation !== false,
      smoothScroll: options.smoothScroll !== false,
      updateURL: options.updateURL !== false,
      scrollOffset: options.scrollOffset || 0,
      ...options
    };
    
    this.sections = [];
    this.currentSectionIndex = 0;
    this.isNavigating = false;
    this.navigationHistory = [];
    
    // Bind methods
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleHashChange = this.handleHashChange.bind(this);
    this.handleNavClick = this.handleNavClick.bind(this);
  }
  
  /**
   * Initialize the navigation controller
   */
  async init() {
    try {
      // Discover sections
      this.discoverSections();
      
      // Set up keyboard navigation
      if (this.options.keyboardNavigation) {
        this.setupKeyboardNavigation();
      }
      
      // Set up URL routing
      if (this.options.updateURL) {
        this.setupURLRouting();
      }
      
      // Set up navigation links
      this.setupNavigationLinks();
      
      // Handle initial URL
      this.handleInitialURL();
      
      console.log(`NavigationController initialized with ${this.sections.length} sections`);
      
    } catch (error) {
      console.error('Failed to initialize NavigationController:', error);
      throw error;
    }
  }
  
  /**
   * Discover all navigable sections
   */
  discoverSections() {
    const sectionElements = document.querySelectorAll('.story-section[id]');
    
    this.sections = Array.from(sectionElements).map((element, index) => ({
      id: element.id,
      element: element,
      index: index,
      title: this.getSectionTitle(element),
      bounds: null
    }));
    
    // Update section bounds
    this.updateSectionBounds();
  }
  
  /**
   * Get section title for navigation
   */
  getSectionTitle(element) {
    // Try to find title in various ways
    const titleElement = element.querySelector('h1, h2, .section-title');
    if (titleElement) {
      return titleElement.textContent.trim();
    }
    
    // Fallback to data attribute or ID
    return element.dataset.title || 
           element.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  /**
   * Set up keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', this.handleKeydown);
    
    // Add focus management
    document.addEventListener('focusin', (e) => {
      this.handleFocusChange(e.target);
    });
  }
  
  /**
   * Handle keyboard events
   */
  handleKeydown(event) {
    // Don't interfere with form inputs
    if (event.target.matches('input, textarea, select, [contenteditable]')) {
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ': // Spacebar
        event.preventDefault();
        this.navigateNext();
        break;
        
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        this.navigatePrevious();
        break;
        
      case 'Home':
        event.preventDefault();
        this.navigateToSection(this.sections[0].id);
        break;
        
      case 'End':
        event.preventDefault();
        this.navigateToSection(this.sections[this.sections.length - 1].id);
        break;
        
      case 'Escape':
        event.preventDefault();
        this.handleEscape();
        break;
        
      // Number keys for direct navigation
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const index = parseInt(event.key) - 1;
          if (index < this.sections.length) {
            this.navigateToSection(this.sections[index].id);
          }
        }
        break;
    }
  }
  
  /**
   * Handle focus changes for accessibility
   */
  handleFocusChange(target) {
    // Find the section containing the focused element
    const section = target.closest('.story-section');
    if (section && section.id) {
      const sectionIndex = this.sections.findIndex(s => s.id === section.id);
      if (sectionIndex !== -1 && sectionIndex !== this.currentSectionIndex) {
        this.currentSectionIndex = sectionIndex;
        this.updateActiveNavigation();
      }
    }
  }
  
  /**
   * Handle escape key
   */
  handleEscape() {
    // Remove focus from current element
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    
    // Focus on main navigation
    const mainNav = document.querySelector('.main-nav');
    if (mainNav) {
      const firstLink = mainNav.querySelector('a, button');
      if (firstLink) {
        firstLink.focus();
      }
    }
  }
  
  /**
   * Set up URL routing
   */
  setupURLRouting() {
    window.addEventListener('hashchange', this.handleHashChange);
    window.addEventListener('popstate', this.handleHashChange);
  }
  
  /**
   * Handle URL hash changes
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash && this.sections.find(s => s.id === hash)) {
      this.navigateToSection(hash, false); // Don't update URL again
    }
  }
  
  /**
   * Handle initial URL
   */
  handleInitialURL() {
    const hash = window.location.hash.slice(1);
    if (hash && this.sections.find(s => s.id === hash)) {
      // Delay to ensure page is loaded
      setTimeout(() => {
        this.navigateToSection(hash, false);
      }, 100);
    }
  }
  
  /**
   * Set up navigation links
   */
  setupNavigationLinks() {
    // Main navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick);
    });
    
    // Any other internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]:not(.nav-link)');
    internalLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick);
    });
  }
  
  /**
   * Handle navigation link clicks
   */
  handleNavClick(event) {
    event.preventDefault();
    
    const href = event.currentTarget.getAttribute('href');
    const sectionId = href.slice(1);
    
    if (sectionId && this.sections.find(s => s.id === sectionId)) {
      this.navigateToSection(sectionId);
    }
  }
  
  /**
   * Navigate to next section
   */
  navigateNext() {
    if (this.currentSectionIndex < this.sections.length - 1) {
      const nextSection = this.sections[this.currentSectionIndex + 1];
      this.navigateToSection(nextSection.id);
    }
  }
  
  /**
   * Navigate to previous section
   */
  navigatePrevious() {
    if (this.currentSectionIndex > 0) {
      const prevSection = this.sections[this.currentSectionIndex - 1];
      this.navigateToSection(prevSection.id);
    }
  }
  
  /**
   * Navigate to specific section
   */
  navigateToSection(sectionId, updateURL = true) {
    if (this.isNavigating) return;
    
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) {
      console.warn(`Section ${sectionId} not found`);
      return;
    }
    
    this.isNavigating = true;
    
    // Update current section index
    const previousIndex = this.currentSectionIndex;
    this.currentSectionIndex = section.index;
    
    // Add to navigation history
    this.navigationHistory.push({
      from: previousIndex,
      to: this.currentSectionIndex,
      timestamp: Date.now()
    });
    
    // Scroll to section
    this.scrollToSection(section).then(() => {
      // Update URL if requested
      if (updateURL && this.options.updateURL) {
        this.updateURL(sectionId);
      }
      
      // Update navigation state
      this.updateActiveNavigation();
      
      // Dispatch navigation event
      this.dispatchNavigationEvent('navigate', {
        section,
        previousIndex,
        currentIndex: this.currentSectionIndex
      });
      
      this.isNavigating = false;
    });
  }
  
  /**
   * Scroll to section with smooth animation
   */
  async scrollToSection(section) {
    const element = section.element;
    const targetY = element.offsetTop + this.options.scrollOffset;
    
    if (this.options.smoothScroll) {
      return this.smoothScrollTo(targetY);
    } else {
      window.scrollTo(0, targetY);
      return Promise.resolve();
    }
  }
  
  /**
   * Smooth scroll to position
   */
  smoothScrollTo(targetY) {
    return new Promise((resolve) => {
      const startY = window.pageYOffset;
      const distance = targetY - startY;
      const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1 second
      const startTime = performance.now();
      
      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };
      
      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        
        const currentY = startY + (distance * easedProgress);
        window.scrollTo(0, currentY);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animateScroll);
    });
  }
  
  /**
   * Update URL hash
   */
  updateURL(sectionId) {
    const newURL = `${window.location.pathname}${window.location.search}#${sectionId}`;
    
    // Use pushState to avoid triggering hashchange
    history.pushState(null, '', newURL);
  }
  
  /**
   * Update active navigation indicators
   */
  updateActiveNavigation() {
    const currentSection = this.sections[this.currentSectionIndex];
    if (!currentSection) return;
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection.id}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
    
    // Update any progress indicators
    this.updateProgressIndicators();
  }
  
  /**
   * Update progress indicators
   */
  updateProgressIndicators() {
    const progress = (this.currentSectionIndex + 1) / this.sections.length;
    
    // Update any progress bars
    const progressBars = document.querySelectorAll('.navigation-progress');
    progressBars.forEach(bar => {
      bar.style.width = `${progress * 100}%`;
    });
    
    // Update section counters
    const currentCounters = document.querySelectorAll('.current-section');
    currentCounters.forEach(counter => {
      counter.textContent = this.currentSectionIndex + 1;
    });
    
    const totalCounters = document.querySelectorAll('.total-sections');
    totalCounters.forEach(counter => {
      counter.textContent = this.sections.length;
    });
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
   * Get current section
   */
  getCurrentSection() {
    return this.sections[this.currentSectionIndex];
  }
  
  /**
   * Get all sections
   */
  getSections() {
    return [...this.sections];
  }
  
  /**
   * Get navigation history
   */
  getNavigationHistory() {
    return [...this.navigationHistory];
  }
  
  /**
   * Check if can navigate next
   */
  canNavigateNext() {
    return this.currentSectionIndex < this.sections.length - 1;
  }
  
  /**
   * Check if can navigate previous
   */
  canNavigatePrevious() {
    return this.currentSectionIndex > 0;
  }
  
  /**
   * Dispatch navigation event
   */
  dispatchNavigationEvent(eventType, data) {
    const event = new CustomEvent(`navigation:${eventType}`, {
      detail: data
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    this.updateSectionBounds();
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.options = { ...this.options, ...newConfig };
  }
  
  /**
   * Start the navigation controller
   */
  start() {
    // Update initial navigation state
    this.updateActiveNavigation();
    
    // Announce navigation availability to screen readers
    this.announceNavigationAvailability();
  }
  
  /**
   * Announce navigation availability to screen readers
   */
  announceNavigationAvailability() {
    if (this.options.keyboardNavigation) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Use arrow keys, page up/down, or space bar to navigate between sections. Press Escape to focus navigation menu.';
      
      document.body.appendChild(announcement);
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 3000);
    }
  }
  
  /**
   * Destroy the navigation controller
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('hashchange', this.handleHashChange);
    window.removeEventListener('popstate', this.handleHashChange);
    
    // Remove navigation link listeners
    const navLinks = document.querySelectorAll('.nav-link[href^="#"], a[href^="#"]:not(.nav-link)');
    navLinks.forEach(link => {
      link.removeEventListener('click', this.handleNavClick);
    });
    
    // Clear data
    this.sections = [];
    this.navigationHistory = [];
    
    console.log('NavigationController destroyed');
  }
}