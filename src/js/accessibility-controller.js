/**
 * ACCESSIBILITY CONTROLLER
 * 
 * Handles accessibility features including screen reader support,
 * keyboard navigation, focus management, and WCAG compliance
 */

export class AccessibilityController {
  constructor(options = {}) {
    this.options = {
      respectReducedMotion: options.respectReducedMotion !== false,
      keyboardNavigation: options.keyboardNavigation !== false,
      screenReaderSupport: options.screenReaderSupport !== false,
      focusManagement: options.focusManagement !== false,
      announceChanges: options.announceChanges !== false,
      ...options
    };
    
    this.focusHistory = [];
    this.currentFocusIndex = -1;
    this.liveRegion = null;
    this.skipLinks = [];
    this.landmarks = [];
    
    // Bind methods
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }
  
  /**
   * Initialize the accessibility controller
   */
  async init() {
    try {
      // Set up ARIA live regions
      this.setupLiveRegions();
      
      // Set up skip links
      this.setupSkipLinks();
      
      // Set up landmarks
      this.setupLandmarks();
      
      // Set up focus management
      if (this.options.focusManagement) {
        this.setupFocusManagement();
      }
      
      // Set up keyboard navigation
      if (this.options.keyboardNavigation) {
        this.setupKeyboardNavigation();
      }
      
      // Set up screen reader support
      if (this.options.screenReaderSupport) {
        this.setupScreenReaderSupport();
      }
      
      // Check for reduced motion preference
      this.setupReducedMotionSupport();
      
      // Set up section announcements
      this.setupSectionAnnouncements();
      
      console.log('AccessibilityController initialized');
      
    } catch (error) {
      console.error('Failed to initialize AccessibilityController:', error);
      throw error;
    }
  }
  
  /**
   * Set up ARIA live regions for announcements
   */
  setupLiveRegions() {
    // Create polite live region
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.id = 'accessibility-announcements';
    
    document.body.appendChild(this.liveRegion);
    
    // Create assertive live region for urgent announcements
    this.assertiveLiveRegion = document.createElement('div');
    this.assertiveLiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveLiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveLiveRegion.className = 'sr-only';
    this.assertiveLiveRegion.id = 'accessibility-urgent-announcements';
    
    document.body.appendChild(this.assertiveLiveRegion);
  }
  
  /**
   * Set up skip links for keyboard navigation
   */
  setupSkipLinks() {
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    skipLinksContainer.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      z-index: 10000;
      text-decoration: none;
      border-radius: 0 0 4px 4px;
      transition: top 0.3s;
    `;
    
    // Create skip links
    const skipLinks = [
      { href: '#main', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#hero', text: 'Skip to beginning' }
    ];
    
    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      
      skipLink.style.cssText = `
        display: block;
        color: #fff;
        text-decoration: none;
        padding: 4px 0;
      `;
      
      // Show on focus
      skipLink.addEventListener('focus', () => {
        skipLinksContainer.style.top = '0';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLinksContainer.style.top = '-40px';
      });
      
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.skipToContent(link.href.slice(1));
      });
      
      skipLinksContainer.appendChild(skipLink);
      this.skipLinks.push(skipLink);
    });
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  }
  
  /**
   * Skip to content section
   */
  skipToContent(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    
    // Make target focusable if it isn't already
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    
    // Focus the target
    target.focus();
    
    // Scroll to target
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Announce the skip
    this.announce(`Skipped to ${this.getElementDescription(target)}`);
  }
  
  /**
   * Set up ARIA landmarks
   */
  setupLandmarks() {
    // Ensure main content has proper landmark
    const main = document.querySelector('main, .story-container');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
      main.setAttribute('aria-label', 'Main content');
    }
    
    // Ensure navigation has proper landmark
    const nav = document.querySelector('nav, .main-nav');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
      nav.setAttribute('aria-label', 'Main navigation');
    }
    
    // Set up section landmarks
    const sections = document.querySelectorAll('.story-section');
    sections.forEach((section, index) => {
      if (!section.getAttribute('role')) {
        section.setAttribute('role', 'region');
        section.setAttribute('aria-labelledby', this.getOrCreateSectionHeading(section, index));
      }
    });
  }
  
  /**
   * Get or create section heading for ARIA labeling
   */
  getOrCreateSectionHeading(section, index) {
    // Look for existing heading
    const heading = section.querySelector('h1, h2, h3, .section-title');
    if (heading && heading.id) {
      return heading.id;
    }
    
    // Create ID for existing heading
    if (heading) {
      const id = `section-${index}-heading`;
      heading.id = id;
      return id;
    }
    
    // Create hidden heading if none exists
    const hiddenHeading = document.createElement('h2');
    hiddenHeading.className = 'sr-only';
    hiddenHeading.id = `section-${index}-heading`;
    hiddenHeading.textContent = section.dataset.title || `Section ${index + 1}`;
    
    section.insertBefore(hiddenHeading, section.firstChild);
    return hiddenHeading.id;
  }
  
  /**
   * Set up focus management
   */
  setupFocusManagement() {
    document.addEventListener('focusin', this.handleFocus);
    document.addEventListener('focusout', this.handleBlur);
    
    // Set up focus trap for modals/overlays
    this.setupFocusTraps();
    
    // Ensure all interactive elements are focusable
    this.ensureFocusableElements();
  }
  
  /**
   * Handle focus events
   */
  handleFocus(event) {
    const target = event.target;
    
    // Add to focus history
    this.focusHistory.push({
      element: target,
      timestamp: Date.now(),
      section: this.getCurrentSection(target)
    });
    
    // Limit history size
    if (this.focusHistory.length > 50) {
      this.focusHistory.shift();
    }
    
    // Update current focus index
    this.currentFocusIndex = this.focusHistory.length - 1;
    
    // Announce focus change if needed
    if (this.shouldAnnounceFocus(target)) {
      this.announceFocusChange(target);
    }
  }
  
  /**
   * Handle blur events
   */
  handleBlur(event) {
    // Clean up any temporary attributes
    const target = event.target;
    if (target.hasAttribute('data-temp-tabindex')) {
      target.removeAttribute('tabindex');
      target.removeAttribute('data-temp-tabindex');
    }
  }
  
  /**
   * Set up focus traps for modal content
   */
  setupFocusTraps() {
    // This would be used for any modal dialogs or overlays
    // For now, we'll set up the basic infrastructure
    this.focusTraps = new Map();
  }
  
  /**
   * Ensure all interactive elements are focusable
   */
  ensureFocusableElements() {
    // Find interactive elements without proper focus handling
    const interactiveSelectors = [
      'button:not([tabindex])',
      'a:not([tabindex])',
      '[role="button"]:not([tabindex])',
      '[onclick]:not([tabindex])',
      '.clickable:not([tabindex])'
    ];
    
    interactiveSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', '0');
        }
      });
    });
  }
  
  /**
   * Set up keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', this.handleKeydown);
  }
  
  /**
   * Handle keyboard events for accessibility
   */
  handleKeydown(event) {
    const target = event.target;
    
    switch (event.key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
        
      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
        
      case 'Escape':
        this.handleEscape(event);
        break;
        
      case 'F6':
        event.preventDefault();
        this.cycleLandmarks(event.shiftKey);
        break;
        
      case 'h':
      case 'H':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.cycleHeadings(event.shiftKey);
        }
        break;
    }
  }
  
  /**
   * Handle tab navigation
   */
  handleTabNavigation(event) {
    // Ensure proper tab order and focus visibility
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(event.target);
    
    // Announce section changes during tab navigation
    setTimeout(() => {
      const newSection = this.getCurrentSection(document.activeElement);
      const oldSection = this.getCurrentSection(event.target);
      
      if (newSection !== oldSection) {
        this.announceSectionChange(newSection);
      }
    }, 0);
  }
  
  /**
   * Handle activation (Enter/Space) on custom elements
   */
  handleActivation(event) {
    const target = event.target;
    
    // Handle custom button-like elements
    if (target.getAttribute('role') === 'button' || target.classList.contains('clickable')) {
      event.preventDefault();
      target.click();
    }
  }
  
  /**
   * Handle escape key
   */
  handleEscape(event) {
    // Close any open menus or modals
    const openMenus = document.querySelectorAll('[aria-expanded="true"]');
    openMenus.forEach(menu => {
      menu.setAttribute('aria-expanded', 'false');
    });
    
    // Return focus to main content
    const main = document.querySelector('main, [role="main"]');
    if (main) {
      main.focus();
    }
  }
  
  /**
   * Cycle through landmarks
   */
  cycleLandmarks(reverse = false) {
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="region"], nav, main');
    const landmarkArray = Array.from(landmarks);
    
    if (landmarkArray.length === 0) return;
    
    const currentLandmark = document.activeElement.closest('[role="main"], [role="navigation"], [role="region"], nav, main');
    let currentIndex = landmarkArray.indexOf(currentLandmark);
    
    if (reverse) {
      currentIndex = currentIndex <= 0 ? landmarkArray.length - 1 : currentIndex - 1;
    } else {
      currentIndex = currentIndex >= landmarkArray.length - 1 ? 0 : currentIndex + 1;
    }
    
    const nextLandmark = landmarkArray[currentIndex];
    this.focusElement(nextLandmark);
    this.announce(`Navigated to ${this.getElementDescription(nextLandmark)}`);
  }
  
  /**
   * Cycle through headings
   */
  cycleHeadings(reverse = false) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    const headingArray = Array.from(headings);
    
    if (headingArray.length === 0) return;
    
    const currentHeading = this.findCurrentHeading();
    let currentIndex = headingArray.indexOf(currentHeading);
    
    if (reverse) {
      currentIndex = currentIndex <= 0 ? headingArray.length - 1 : currentIndex - 1;
    } else {
      currentIndex = currentIndex >= headingArray.length - 1 ? 0 : currentIndex + 1;
    }
    
    const nextHeading = headingArray[currentIndex];
    this.focusElement(nextHeading);
    this.announce(`Heading: ${nextHeading.textContent.trim()}`);
  }
  
  /**
   * Find current heading relative to focus
   */
  findCurrentHeading() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    const currentElement = document.activeElement;
    
    // Find the heading that comes before or contains the current element
    let currentHeading = null;
    
    for (const heading of headings) {
      if (heading.contains(currentElement) || 
          heading.compareDocumentPosition(currentElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
        currentHeading = heading;
      } else {
        break;
      }
    }
    
    return currentHeading || headings[0];
  }
  
  /**
   * Set up screen reader support
   */
  setupScreenReaderSupport() {
    // Add screen reader specific content
    this.addScreenReaderContent();
    
    // Set up dynamic content announcements
    this.setupDynamicAnnouncements();
    
    // Ensure proper ARIA attributes
    this.ensureARIAAttributes();
  }
  
  /**
   * Add content specifically for screen readers
   */
  addScreenReaderContent() {
    // Add instructions for screen reader users
    const instructions = document.createElement('div');
    instructions.className = 'sr-only';
    instructions.innerHTML = `
      <h1>Diagrama Australia Presentation</h1>
      <p>This is an interactive presentation about transforming youth justice. 
         Use arrow keys to navigate between sections, or use the navigation menu. 
         Press H to cycle through headings, F6 to cycle through page regions.</p>
    `;
    
    document.body.insertBefore(instructions, document.body.firstChild);
  }
  
  /**
   * Set up dynamic content announcements
   */
  setupDynamicAnnouncements() {
    // Listen for content changes
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            this.handleDynamicContent(mutation.addedNodes);
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      this.mutationObserver = observer;
    }
  }
  
  /**
   * Handle dynamically added content
   */
  handleDynamicContent(addedNodes) {
    addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Ensure new interactive elements are accessible
        this.ensureElementAccessibility(node);
        
        // Announce important new content
        if (this.shouldAnnounceNewContent(node)) {
          this.announceNewContent(node);
        }
      }
    });
  }
  
  /**
   * Ensure element accessibility
   */
  ensureElementAccessibility(element) {
    // Add missing ARIA attributes
    if (element.matches('button, [role="button"]') && !element.hasAttribute('aria-label') && !element.textContent.trim()) {
      element.setAttribute('aria-label', 'Button');
    }
    
    // Ensure focusable elements have tabindex
    if (element.matches('[onclick], .clickable') && !element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    
    // Add role to custom interactive elements
    if (element.classList.contains('clickable') && !element.getAttribute('role')) {
      element.setAttribute('role', 'button');
    }
  }
  
  /**
   * Set up reduced motion support
   */
  setupReducedMotionSupport() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (e) => {
      if (e.matches && this.options.respectReducedMotion) {
        document.body.classList.add('reduced-motion');
        this.announce('Animations have been reduced based on your system preferences');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    };
    
    mediaQuery.addEventListener('change', handleReducedMotion);
    handleReducedMotion(mediaQuery); // Initial check
  }
  
  /**
   * Set up section change announcements
   */
  setupSectionAnnouncements() {
    // Listen for section changes
    document.addEventListener('navigation:navigate', (event) => {
      if (this.options.announceChanges) {
        const section = event.detail.section;
        this.announceSectionChange(section);
      }
    });
  }
  
  /**
   * Announce section change
   */
  announceSectionChange(section) {
    if (!section) return;
    
    const sectionTitle = this.getSectionTitle(section);
    const sectionIndex = this.getSectionIndex(section);
    const totalSections = document.querySelectorAll('.story-section').length;
    
    this.announce(`Section ${sectionIndex + 1} of ${totalSections}: ${sectionTitle}`);
  }
  
  /**
   * Get section title
   */
  getSectionTitle(section) {
    if (typeof section === 'string') {
      section = document.getElementById(section);
    }
    
    if (!section) return 'Unknown section';
    
    const heading = section.querySelector('h1, h2, h3, .section-title');
    if (heading) {
      return heading.textContent.trim();
    }
    
    return section.dataset.title || section.id || 'Untitled section';
  }
  
  /**
   * Get section index
   */
  getSectionIndex(section) {
    if (typeof section === 'string') {
      section = document.getElementById(section);
    }
    
    const sections = document.querySelectorAll('.story-section');
    return Array.from(sections).indexOf(section);
  }
  
  /**
   * Get current section containing element
   */
  getCurrentSection(element) {
    return element.closest('.story-section');
  }
  
  /**
   * Get focusable elements
   */
  getFocusableElements() {
    const selector = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
    return Array.from(document.querySelectorAll(selector)).filter(el => {
      return !el.disabled && !el.hidden && el.offsetParent !== null;
    });
  }
  
  /**
   * Focus element safely
   */
  focusElement(element) {
    if (!element) return;
    
    // Make element focusable if it isn't already
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
      element.setAttribute('data-temp-tabindex', 'true');
    }
    
    element.focus();
    
    // Scroll into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  /**
   * Should announce focus change
   */
  shouldAnnounceFocus(element) {
    // Don't announce every focus change, only important ones
    return element.matches('button, [role="button"], a, [role="link"]') &&
           !element.closest('.nav-sections'); // Don't announce nav links
  }
  
  /**
   * Announce focus change
   */
  announceFocusChange(element) {
    const description = this.getElementDescription(element);
    this.announce(description, false); // Use polite announcement
  }
  
  /**
   * Should announce new content
   */
  shouldAnnounceNewContent(element) {
    return element.matches('.notification, .alert, [role="alert"], [role="status"]');
  }
  
  /**
   * Announce new content
   */
  announceNewContent(element) {
    const text = element.textContent.trim();
    if (text) {
      this.announce(text, element.matches('[role="alert"]'));
    }
  }
  
  /**
   * Get element description for announcements
   */
  getElementDescription(element) {
    // Try various methods to get a meaningful description
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }
    
    if (element.getAttribute('aria-labelledby')) {
      const labelElement = document.getElementById(element.getAttribute('aria-labelledby'));
      if (labelElement) {
        return labelElement.textContent.trim();
      }
    }
    
    if (element.textContent.trim()) {
      return element.textContent.trim();
    }
    
    if (element.getAttribute('title')) {
      return element.getAttribute('title');
    }
    
    // Fallback based on element type
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    return `${role || tagName} element`;
  }
  
  /**
   * Announce message to screen readers
   */
  announce(message, urgent = false) {
    if (!message || !this.options.announceChanges) return;
    
    const liveRegion = urgent ? this.assertiveLiveRegion : this.liveRegion;
    
    // Clear previous announcement
    liveRegion.textContent = '';
    
    // Add new announcement after a brief delay
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
    
    // Clear announcement after it's been read
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 5000);
  }
  
  /**
   * Ensure proper ARIA attributes
   */
  ensureARIAAttributes() {
    // Ensure all sections have proper labeling
    const sections = document.querySelectorAll('.story-section');
    sections.forEach((section, index) => {
      if (!section.getAttribute('aria-labelledby') && !section.getAttribute('aria-label')) {
        const heading = section.querySelector('h1, h2, h3, .section-title');
        if (heading && !heading.id) {
          heading.id = `section-${index}-heading`;
        }
        if (heading) {
          section.setAttribute('aria-labelledby', heading.id);
        }
      }
    });
    
    // Ensure navigation has proper attributes
    const nav = document.querySelector('.main-nav');
    if (nav && !nav.getAttribute('aria-label')) {
      nav.setAttribute('aria-label', 'Main navigation');
    }
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.options = { ...this.options, ...newConfig };
  }
  
  /**
   * Start the accessibility controller
   */
  start() {
    // Announce that the presentation is ready
    this.announce('Interactive presentation loaded and ready. Use arrow keys to navigate between sections.');
  }
  
  /**
   * Destroy the accessibility controller
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('focusin', this.handleFocus);
    document.removeEventListener('focusout', this.handleBlur);
    
    // Disconnect mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // Remove live regions
    if (this.liveRegion) {
      this.liveRegion.remove();
    }
    if (this.assertiveLiveRegion) {
      this.assertiveLiveRegion.remove();
    }
    
    // Clear references
    this.focusHistory = [];
    this.skipLinks = [];
    this.landmarks = [];
    
    console.log('AccessibilityController destroyed');
  }
}