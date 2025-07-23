/**
 * PROGRESS INDICATOR
 * 
 * Handles scroll progress visualization and section tracking
 * Provides visual feedback for user navigation through the story
 */

export class ProgressIndicator {
  constructor(options = {}) {
    this.options = {
      showScrollProgress: options.showScrollProgress !== false,
      showSectionProgress: options.showSectionProgress !== false,
      updateInterval: options.updateInterval || 16, // ~60fps
      smoothing: options.smoothing !== false,
      ...options
    };
    
    this.scrollProgress = 0;
    this.sectionProgress = 0;
    this.currentSection = 0;
    this.totalSections = 0;
    this.isUpdating = false;
    
    // DOM elements
    this.progressBar = null;
    this.sectionIndicator = null;
    this.sectionDots = [];
    
    // Bind methods
    this.updateProgress = this.updateProgress.bind(this);
  }
  
  /**
   * Initialize the progress indicator
   */
  async init() {
    try {
      // Find or create progress elements
      this.setupProgressElements();
      
      // Discover sections
      this.discoverSections();
      
      // Set up section indicators
      this.setupSectionIndicators();
      
      // Initial update
      this.updateProgress();
      
      console.log('ProgressIndicator initialized');
      
    } catch (error) {
      console.error('Failed to initialize ProgressIndicator:', error);
      throw error;
    }
  }
  
  /**
   * Set up progress bar elements
   */
  setupProgressElements() {
    // Find existing progress bar
    this.progressBar = document.querySelector('.scroll-progress-bar');
    
    if (!this.progressBar && this.options.showScrollProgress) {
      this.createProgressBar();
    }
    
    // Find or create section indicator
    this.sectionIndicator = document.querySelector('.section-indicator');
    
    if (!this.sectionIndicator && this.options.showSectionProgress) {
      this.createSectionIndicator();
    }
  }
  
  /**
   * Create progress bar if it doesn't exist
   */
  createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress';
    progressContainer.setAttribute('aria-hidden', 'true');
    
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-progress-bar';
    
    progressContainer.appendChild(this.progressBar);
    document.body.appendChild(progressContainer);
  }
  
  /**
   * Create section indicator
   */
  createSectionIndicator() {
    this.sectionIndicator = document.createElement('div');
    this.sectionIndicator.className = 'section-indicator';
    this.sectionIndicator.setAttribute('role', 'navigation');
    this.sectionIndicator.setAttribute('aria-label', 'Section progress');
    
    // Position it
    this.sectionIndicator.style.cssText = `
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    
    document.body.appendChild(this.sectionIndicator);
  }
  
  /**
   * Discover sections for progress tracking
   */
  discoverSections() {
    const sections = document.querySelectorAll('.story-section[id]');
    this.totalSections = sections.length;
    
    // Update any total section counters
    const totalCounters = document.querySelectorAll('.total-sections');
    totalCounters.forEach(counter => {
      counter.textContent = this.totalSections;
    });
  }
  
  /**
   * Set up section indicator dots
   */
  setupSectionIndicators() {
    if (!this.sectionIndicator || this.totalSections === 0) return;
    
    // Clear existing dots
    this.sectionIndicator.innerHTML = '';
    this.sectionDots = [];
    
    // Create dots for each section
    const sections = document.querySelectorAll('.story-section[id]');
    sections.forEach((section, index) => {
      const dot = this.createSectionDot(section, index);
      this.sectionDots.push(dot);
      this.sectionIndicator.appendChild(dot);
    });
  }
  
  /**
   * Create a section indicator dot
   */
  createSectionDot(section, index) {
    const dot = document.createElement('button');
    dot.className = 'section-dot';
    dot.setAttribute('aria-label', `Go to section ${index + 1}: ${this.getSectionTitle(section)}`);
    dot.setAttribute('data-section-id', section.id);
    dot.setAttribute('data-section-index', index);
    
    // Style the dot
    dot.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    `;
    
    // Add click handler
    dot.addEventListener('click', () => {
      this.navigateToSection(section.id);
    });
    
    // Add hover effects
    dot.addEventListener('mouseenter', () => {
      this.showSectionTooltip(dot, section);
    });
    
    dot.addEventListener('mouseleave', () => {
      this.hideSectionTooltip();
    });
    
    return dot;
  }
  
  /**
   * Get section title for tooltip
   */
  getSectionTitle(section) {
    const titleElement = section.querySelector('h1, h2, .section-title');
    if (titleElement) {
      return titleElement.textContent.trim();
    }
    
    return section.dataset.title || 
           section.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  /**
   * Show section tooltip
   */
  showSectionTooltip(dot, section) {
    // Remove existing tooltip
    this.hideSectionTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'section-tooltip';
    tooltip.textContent = this.getSectionTitle(section);
    
    tooltip.style.cssText = `
      position: absolute;
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      margin-right: 8px;
      pointer-events: none;
      z-index: 1000;
    `;
    
    dot.appendChild(tooltip);
  }
  
  /**
   * Hide section tooltip
   */
  hideSectionTooltip() {
    const existingTooltip = document.querySelector('.section-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
  }
  
  /**
   * Navigate to section (delegate to navigation controller)
   */
  navigateToSection(sectionId) {
    // Dispatch event for navigation controller to handle
    const event = new CustomEvent('progress:navigate', {
      detail: { sectionId }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Update progress indicators
   */
  updateProgress() {
    if (this.isUpdating) return;
    this.isUpdating = true;
    
    requestAnimationFrame(() => {
      // Calculate scroll progress
      this.calculateScrollProgress();
      
      // Calculate section progress
      this.calculateSectionProgress();
      
      // Update visual indicators
      this.updateVisualIndicators();
      
      this.isUpdating = false;
    });
  }
  
  /**
   * Calculate scroll progress (0-1)
   */
  calculateScrollProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (scrollHeight <= 0) {
      this.scrollProgress = 0;
      return;
    }
    
    const newProgress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
    
    // Apply smoothing
    if (this.options.smoothing) {
      this.scrollProgress = this.lerp(this.scrollProgress, newProgress, 0.1);
    } else {
      this.scrollProgress = newProgress;
    }
  }
  
  /**
   * Calculate current section progress
   */
  calculateSectionProgress() {
    const sections = document.querySelectorAll('.story-section[id]');
    const viewportCenter = window.innerHeight / 2;
    let currentSectionIndex = 0;
    let maxVisibility = 0;
    
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
      const visibility = Math.max(0, 1 - distanceFromCenter / viewportCenter);
      
      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        currentSectionIndex = index;
      }
    });
    
    // Update current section if changed
    if (currentSectionIndex !== this.currentSection) {
      this.currentSection = currentSectionIndex;
      this.onSectionChange(currentSectionIndex);
    }
    
    // Calculate progress within current section
    if (sections[currentSectionIndex]) {
      const section = sections[currentSectionIndex];
      const rect = section.getBoundingClientRect();
      const sectionProgress = Math.max(0, Math.min(1, 
        (viewportCenter - rect.top) / rect.height
      ));
      
      this.sectionProgress = sectionProgress;
    }
  }
  
  /**
   * Update visual indicators
   */
  updateVisualIndicators() {
    // Update scroll progress bar
    if (this.progressBar) {
      const width = `${this.scrollProgress * 100}%`;
      if (this.progressBar.style.width !== width) {
        this.progressBar.style.width = width;
      }
    }
    
    // Update section dots
    this.updateSectionDots();
    
    // Update section counters
    this.updateSectionCounters();
  }
  
  /**
   * Update section indicator dots
   */
  updateSectionDots() {
    this.sectionDots.forEach((dot, index) => {
      const isActive = index === this.currentSection;
      const isPassed = index < this.currentSection;
      
      if (isActive) {
        dot.style.background = 'rgba(255, 255, 255, 1)';
        dot.style.borderColor = 'rgba(255, 255, 255, 1)';
        dot.style.transform = 'scale(1.2)';
      } else if (isPassed) {
        dot.style.background = 'rgba(255, 255, 255, 0.7)';
        dot.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        dot.style.transform = 'scale(1)';
      } else {
        dot.style.background = 'transparent';
        dot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        dot.style.transform = 'scale(1)';
      }
    });
  }
  
  /**
   * Update section counters
   */
  updateSectionCounters() {
    const currentCounters = document.querySelectorAll('.current-section');
    currentCounters.forEach(counter => {
      const newValue = this.currentSection + 1;
      if (counter.textContent !== newValue.toString()) {
        counter.textContent = newValue;
      }
    });
  }
  
  /**
   * Handle section change
   */
  onSectionChange(newSectionIndex) {
    // Dispatch section change event
    const event = new CustomEvent('progress:sectionChange', {
      detail: {
        currentSection: newSectionIndex,
        previousSection: this.currentSection,
        progress: this.scrollProgress
      }
    });
    document.dispatchEvent(event);
    
    // Update navigation state
    this.updateNavigationState(newSectionIndex);
  }
  
  /**
   * Update navigation state
   */
  updateNavigationState(sectionIndex) {
    const sections = document.querySelectorAll('.story-section[id]');
    const currentSection = sections[sectionIndex];
    
    if (!currentSection) return;
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection.id}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  /**
   * Linear interpolation for smooth animations
   */
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
  
  /**
   * Set current section manually
   */
  setCurrentSection(sectionIndex) {
    if (sectionIndex >= 0 && sectionIndex < this.totalSections) {
      this.currentSection = sectionIndex;
      this.updateVisualIndicators();
    }
  }
  
  /**
   * Get current progress data
   */
  getProgress() {
    return {
      scrollProgress: this.scrollProgress,
      sectionProgress: this.sectionProgress,
      currentSection: this.currentSection,
      totalSections: this.totalSections
    };
  }
  
  /**
   * Show progress indicators
   */
  show() {
    if (this.progressBar) {
      this.progressBar.parentElement.style.display = 'block';
    }
    if (this.sectionIndicator) {
      this.sectionIndicator.style.display = 'flex';
    }
  }
  
  /**
   * Hide progress indicators
   */
  hide() {
    if (this.progressBar) {
      this.progressBar.parentElement.style.display = 'none';
    }
    if (this.sectionIndicator) {
      this.sectionIndicator.style.display = 'none';
    }
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    // Recalculate progress on resize
    this.updateProgress();
  }
  
  /**
   * Start progress tracking
   */
  start() {
    // Set up scroll listener
    let scrollTimeout;
    
    const handleScroll = () => {
      this.updateProgress();
      
      // Debounce scroll end detection
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.onScrollEnd();
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    this.scrollListener = handleScroll;
    
    // Initial update
    this.updateProgress();
  }
  
  /**
   * Handle scroll end
   */
  onScrollEnd() {
    // Dispatch scroll end event
    const event = new CustomEvent('progress:scrollEnd', {
      detail: this.getProgress()
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.options = { ...this.options, ...newConfig };
    
    // Re-setup elements if needed
    if (newConfig.showScrollProgress !== undefined) {
      this.setupProgressElements();
    }
    if (newConfig.showSectionProgress !== undefined) {
      this.setupSectionIndicators();
    }
  }
  
  /**
   * Destroy the progress indicator
   */
  destroy() {
    // Remove scroll listener
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    
    // Remove created elements
    if (this.progressBar && this.progressBar.parentElement) {
      this.progressBar.parentElement.remove();
    }
    if (this.sectionIndicator) {
      this.sectionIndicator.remove();
    }
    
    // Clear references
    this.progressBar = null;
    this.sectionIndicator = null;
    this.sectionDots = [];
    
    console.log('ProgressIndicator destroyed');
  }
}