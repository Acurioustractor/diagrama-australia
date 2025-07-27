/**
 * CONTENT MANAGER
 * 
 * Handles dynamic content loading, updates, and management
 * Provides easy interface for updating presentation content
 */

export class ContentManager {
  constructor(options = {}) {
    this.options = {
      contentPath: options.contentPath || './content/',
      enableHotReload: options.enableHotReload || false,
      cacheContent: options.cacheContent !== false,
      ...options
    };
    
    this.contentCache = new Map();
    this.contentStructure = null;
    this.watchers = new Map();
    
    // Bind methods
    this.handleContentUpdate = this.handleContentUpdate.bind(this);
  }
  
  /**
   * Initialize the content manager
   */
  async init() {
    try {
      // Load content structure
      await this.loadContentStructure();
      
      // Set up hot reload if enabled
      if (this.options.enableHotReload && this.isDevelopment()) {
        this.setupHotReload();
      }
      
      console.log('ContentManager initialized');
      
    } catch (error) {
      console.error('Failed to initialize ContentManager:', error);
      throw error;
    }
  }
  
  /**
   * Load content structure configuration
   */
  async loadContentStructure() {
    try {
      const response = await fetch(`${this.options.contentPath}structure.json`);
      if (!response.ok) {
        throw new Error(`Failed to load content structure: ${response.status}`);
      }
      
      this.contentStructure = await response.json();
      
      // Validate structure
      this.validateContentStructure();
      
    } catch (error) {
      console.warn('Content structure not found, using default structure');
      this.contentStructure = this.getDefaultStructure();
    }
  }
  
  /**
   * Get default content structure
   */
  getDefaultStructure() {
    return {
      version: "1.0.0",
      sections: [
        {
          id: "hero",
          title: "Hero Section",
          type: "hero",
          contentFile: "hero.json",
          mediaFiles: ["hero-video.mp4", "hero-background.jpg"]
        },
        {
          id: "crisis",
          title: "The Crisis",
          type: "crisis",
          contentFile: "crisis.json",
          mediaFiles: ["crisis-background.jpg"]
        },
        {
          id: "solution",
          title: "The Solution",
          type: "solution",
          contentFile: "solution.json",
          mediaFiles: ["solution-background.jpg"]
        },
        {
          id: "implementation",
          title: "Implementation",
          type: "timeline",
          contentFile: "implementation.json",
          mediaFiles: []
        },
        {
          id: "investment",
          title: "Investment",
          type: "investment",
          contentFile: "investment.json",
          mediaFiles: ["investment-background.jpg", "kate-bjur.jpg", "ben-knight.jpg"]
        }
      ],
      globalContent: {
        navigation: "navigation.json",
        metadata: "metadata.json"
      }
    };
  }
  
  /**
   * Validate content structure
   */
  validateContentStructure() {
    if (!this.contentStructure.sections || !Array.isArray(this.contentStructure.sections)) {
      throw new Error('Invalid content structure: sections must be an array');
    }
    
    // Validate each section
    this.contentStructure.sections.forEach((section, index) => {
      if (!section.id || !section.contentFile) {
        throw new Error(`Invalid section at index ${index}: missing id or contentFile`);
      }
    });
  }
  
  /**
   * Load content for a specific section
   */
  async loadSectionContent(sectionId) {
    // Check cache first
    if (this.options.cacheContent && this.contentCache.has(sectionId)) {
      return this.contentCache.get(sectionId);
    }
    
    const section = this.contentStructure.sections.find(s => s.id === sectionId);
    if (!section) {
      throw new Error(`Section ${sectionId} not found in content structure`);
    }
    
    try {
      const response = await fetch(`${this.options.contentPath}${section.contentFile}`);
      if (!response.ok) {
        throw new Error(`Failed to load content for ${sectionId}: ${response.status}`);
      }
      
      const content = await response.json();
      
      // Validate content
      this.validateSectionContent(content, section);
      
      // Cache content
      if (this.options.cacheContent) {
        this.contentCache.set(sectionId, content);
      }
      
      return content;
      
    } catch (error) {
      console.error(`Error loading content for section ${sectionId}:`, error);
      return this.getDefaultSectionContent(section);
    }
  }
  
  /**
   * Validate section content
   */
  validateSectionContent(content, section) {
    // Basic validation - ensure required fields exist
    if (!content.title && !content.heading) {
      console.warn(`Section ${section.id} missing title/heading`);
    }
    
    // Type-specific validation
    switch (section.type) {
      case 'hero':
        this.validateHeroContent(content);
        break;
      case 'crisis':
        this.validateCrisisContent(content);
        break;
      case 'solution':
        this.validateSolutionContent(content);
        break;
      case 'timeline':
        this.validateTimelineContent(content);
        break;
      case 'investment':
        this.validateInvestmentContent(content);
        break;
    }
  }
  
  /**
   * Validate hero content
   */
  validateHeroContent(content) {
    if (!content.title || !content.subtitle) {
      console.warn('Hero section missing title or subtitle');
    }
    if (!content.stats || !Array.isArray(content.stats)) {
      console.warn('Hero section missing stats array');
    }
  }
  
  /**
   * Validate crisis content
   */
  validateCrisisContent(content) {
    if (!content.statistics || !Array.isArray(content.statistics)) {
      console.warn('Crisis section missing statistics array');
    }
  }
  
  /**
   * Validate solution content
   */
  validateSolutionContent(content) {
    if (!content.comparison || !content.features) {
      console.warn('Solution section missing comparison or features');
    }
  }
  
  /**
   * Validate timeline content
   */
  validateTimelineContent(content) {
    if (!content.timeline || !Array.isArray(content.timeline)) {
      console.warn('Timeline section missing timeline array');
    }
  }
  
  /**
   * Validate investment content
   */
  validateInvestmentContent(content) {
    if (!content.tiers || !Array.isArray(content.tiers)) {
      console.warn('Investment section missing tiers array');
    }
  }
  
  /**
   * Get default content for a section
   */
  getDefaultSectionContent(section) {
    const defaults = {
      hero: {
        title: "Diagrama Australia",
        subtitle: "Transforming Youth Justice Through Proven Excellence",
        tagline: "From 80% recidivism to 13.6% success stories",
        stats: [
          { number: "35", label: "Years of Proven Results" },
          { number: "0", label: "Suicides in 23+ Years" },
          { number: "40,000+", label: "Young Lives Transformed" }
        ]
      },
      crisis: {
        title: "Australia is looking for solutions",
        subtitle: "It's time to trial another approach",
        statistics: [
          { number: "80-96", suffix: "%", label: "Recidivism Rate in Australia" },
          { prefix: "$", number: "1500", label: "Cost per young person per day in detention" },
          { number: "60", suffix: "%", label: "Aboriginal & Torres Strait Islander young people in detention", context: "(vs 7.7% of population)" }
        ]
      },
      solution: {
        title: "The Diagrama Model",
        subtitle: "35 Years of Proven Excellence",
        comparison: {
          before: {
            title: "Traditional Approach",
            stats: [
              { number: "80-96%", label: "Recidivism Rate", type: "negative" },
              { number: "Safe", label: "For Staff & Young People", type: "positive" },
              { number: "Therapeutic", label: "Love & Boundaries", type: "positive" }
            ]
          },
          after: {
            title: "Diagrama Model",
            stats: [
              { number: "13.6%", label: "Recidivism Rate", type: "positive" },
              { number: "0", label: "Suicides in 23+ Years", type: "positive" },
              { number: "Therapeutic", label: "Love & Boundaries", type: "positive" }
            ]
          }
        }
      }
    };
    
    return defaults[section.type] || { title: section.title, content: "Content not available" };
  }
  
  /**
   * Update section content
   */
  async updateSectionContent(sectionId, newContent) {
    try {
      // Validate new content
      const section = this.contentStructure.sections.find(s => s.id === sectionId);
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }
      
      this.validateSectionContent(newContent, section);
      
      // Update cache
      this.contentCache.set(sectionId, newContent);
      
      // Update DOM
      await this.updateSectionDOM(sectionId, newContent);
      
      // Dispatch update event
      this.dispatchContentUpdateEvent(sectionId, newContent);
      
      console.log(`Content updated for section: ${sectionId}`);
      
    } catch (error) {
      console.error(`Failed to update content for ${sectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update section DOM with new content
   */
  async updateSectionDOM(sectionId, content) {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) {
      console.warn(`Section element ${sectionId} not found in DOM`);
      return;
    }
    
    const section = this.contentStructure.sections.find(s => s.id === sectionId);
    
    // Update based on section type
    switch (section.type) {
      case 'hero':
        this.updateHeroDOM(sectionElement, content);
        break;
      case 'crisis':
        this.updateCrisisDOM(sectionElement, content);
        break;
      case 'solution':
        this.updateSolutionDOM(sectionElement, content);
        break;
      case 'timeline':
        this.updateTimelineDOM(sectionElement, content);
        break;
      case 'investment':
        this.updateInvestmentDOM(sectionElement, content);
        break;
      default:
        this.updateGenericDOM(sectionElement, content);
    }
  }
  
  /**
   * Update hero section DOM
   */
  updateHeroDOM(element, content) {
    // Update title
    const titleElement = element.querySelector('.hero-title');
    if (titleElement && content.title) {
      titleElement.innerHTML = content.title.split('\n').map(line => 
        `<span class="title-line">${line}</span>`
      ).join('');
    }
    
    // Update subtitle
    const subtitleElement = element.querySelector('.hero-subtitle');
    if (subtitleElement && content.subtitle) {
      subtitleElement.textContent = content.subtitle;
    }
    
    // Update stats
    if (content.stats) {
      const statsContainer = element.querySelector('.hero-stats');
      if (statsContainer) {
        statsContainer.innerHTML = content.stats.map(stat => `
          <div class="hero-stat">
            <span class="stat-number">${stat.number}</span>
            <span class="stat-label">${stat.label}</span>
          </div>
        `).join('');
      }
    }
  }
  
  /**
   * Update crisis section DOM
   */
  updateCrisisDOM(element, content) {
    // Update title and subtitle
    this.updateSectionHeader(element, content);
    
    // Update statistics
    if (content.statistics) {
      const statsContainer = element.querySelector('.crisis-stats');
      if (statsContainer) {
        statsContainer.innerHTML = content.statistics.map(stat => `
          <div class="crisis-stat">
            ${stat.prefix ? `<span class="stat-prefix">${stat.prefix}</span>` : ''}
            <span class="stat-number" data-target="${stat.number}">0</span>
            ${stat.suffix ? `<span class="stat-suffix">${stat.suffix}</span>` : ''}
            <span class="stat-label">${stat.label}</span>
            ${stat.context ? `<span class="stat-context">${stat.context}</span>` : ''}
          </div>
        `).join('');
      }
    }
  }
  
  /**
   * Update solution section DOM
   */
  updateSolutionDOM(element, content) {
    this.updateSectionHeader(element, content);
    
    // Update comparison if present
    if (content.comparison) {
      const beforeElement = element.querySelector('.comparison-before');
      const afterElement = element.querySelector('.comparison-after');
      
      if (beforeElement && content.comparison.before) {
        this.updateComparisonSide(beforeElement, content.comparison.before);
      }
      
      if (afterElement && content.comparison.after) {
        this.updateComparisonSide(afterElement, content.comparison.after);
      }
    }
  }
  
  /**
   * Update comparison side
   */
  updateComparisonSide(element, data) {
    const titleElement = element.querySelector('h3');
    if (titleElement) {
      titleElement.textContent = data.title;
    }
    
    const statsContainer = element.querySelector('.comparison-stats');
    if (statsContainer && data.stats) {
      statsContainer.innerHTML = data.stats.map(stat => `
        <div class="comparison-stat ${stat.type}">
          <span class="stat-number">${stat.number}</span>
          <span class="stat-label">${stat.label}</span>
        </div>
      `).join('');
    }
  }
  
  /**
   * Update timeline section DOM
   */
  updateTimelineDOM(element, content) {
    this.updateSectionHeader(element, content);
    
    if (content.timeline) {
      const timelineContainer = element.querySelector('.timeline-track');
      if (timelineContainer) {
        timelineContainer.innerHTML = content.timeline.map((item, index) => `
          <div class="timeline-item" data-year="${item.year}" data-animate="timeline">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h3>${item.title}</h3>
              <div class="timeline-duration">${item.duration} • ${item.budget}</div>
              <p>${item.description}</p>
              ${item.outcomes ? `
                <ul class="timeline-outcomes">
                  ${item.outcomes.map(outcome => `<li>${outcome}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          </div>
        `).join('');
      }
    }
  }
  
  /**
   * Update investment section DOM
   */
  updateInvestmentDOM(element, content) {
    this.updateSectionHeader(element, content);
    
    if (content.tiers) {
      const tiersContainer = element.querySelector('.investment-tiers');
      if (tiersContainer) {
        tiersContainer.innerHTML = content.tiers.map(tier => `
          <div class="tier-item" data-animate="slide-up">
            <h4>${tier.title}</h4>
            <div class="tier-amount">${tier.amount}</div>
            <ul class="tier-benefits">
              ${tier.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
          </div>
        `).join('');
      }
    }
  }
  
  /**
   * Update generic section DOM
   */
  updateGenericDOM(element, content) {
    this.updateSectionHeader(element, content);
    
    // Update main content if present
    const contentElement = element.querySelector('.section-content p, .section-description');
    if (contentElement && content.content) {
      contentElement.textContent = content.content;
    }
  }
  
  /**
   * Update section header (title and subtitle)
   */
  updateSectionHeader(element, content) {
    const titleElement = element.querySelector('.section-title, h1, h2');
    if (titleElement && content.title) {
      titleElement.textContent = content.title;
    }
    
    const subtitleElement = element.querySelector('.section-subtitle');
    if (subtitleElement && content.subtitle) {
      subtitleElement.textContent = content.subtitle;
    }
  }
  
  /**
   * Load all section content
   */
  async loadAllContent() {
    const loadPromises = this.contentStructure.sections.map(section => 
      this.loadSectionContent(section.id)
    );
    
    try {
      const allContent = await Promise.all(loadPromises);
      
      // Create content map
      const contentMap = new Map();
      this.contentStructure.sections.forEach((section, index) => {
        contentMap.set(section.id, allContent[index]);
      });
      
      return contentMap;
      
    } catch (error) {
      console.error('Failed to load all content:', error);
      throw error;
    }
  }
  
  /**
   * Get content structure
   */
  getContentStructure() {
    return this.contentStructure;
  }
  
  /**
   * Get cached content
   */
  getCachedContent(sectionId) {
    return this.contentCache.get(sectionId);
  }
  
  /**
   * Clear content cache
   */
  clearCache(sectionId = null) {
    if (sectionId) {
      this.contentCache.delete(sectionId);
    } else {
      this.contentCache.clear();
    }
  }
  
  /**
   * Check if running in development mode
   */
  isDevelopment() {
    return import.meta.env.DEV || process.env.NODE_ENV === 'development';
  }
  
  /**
   * Set up hot reload for development
   */
  setupHotReload() {
    if (!this.isDevelopment()) return;
    
    // This would integrate with Vite's HMR in a real implementation
    console.log('Hot reload enabled for content updates');
    
    // Listen for content update events
    document.addEventListener('content:update', this.handleContentUpdate);
  }
  
  /**
   * Handle content update events
   */
  handleContentUpdate(event) {
    const { sectionId, content } = event.detail;
    this.updateSectionContent(sectionId, content);
  }
  
  /**
   * Dispatch content update event
   */
  dispatchContentUpdateEvent(sectionId, content) {
    const event = new CustomEvent('content:updated', {
      detail: { sectionId, content }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Export content for backup/sharing
   */
  exportContent() {
    const exportData = {
      structure: this.contentStructure,
      content: Object.fromEntries(this.contentCache),
      timestamp: new Date().toISOString(),
      version: this.contentStructure.version || '1.0.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import content from backup
   */
  async importContent(importData) {
    try {
      const data = typeof importData === 'string' ? JSON.parse(importData) : importData;
      
      // Validate import data
      if (!data.structure || !data.content) {
        throw new Error('Invalid import data format');
      }
      
      // Update structure
      this.contentStructure = data.structure;
      
      // Update cache
      this.contentCache.clear();
      Object.entries(data.content).forEach(([sectionId, content]) => {
        this.contentCache.set(sectionId, content);
      });
      
      // Update DOM
      for (const [sectionId, content] of this.contentCache) {
        await this.updateSectionDOM(sectionId, content);
      }
      
      console.log('Content imported successfully');
      
    } catch (error) {
      console.error('Failed to import content:', error);
      throw error;
    }
  }
  
  /**
   * Destroy the content manager
   */
  destroy() {
    // Clear cache
    this.contentCache.clear();
    
    // Remove event listeners
    document.removeEventListener('content:update', this.handleContentUpdate);
    
    // Clear watchers
    this.watchers.clear();
    
    console.log('ContentManager destroyed');
  }
}