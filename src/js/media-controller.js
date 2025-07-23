/**
 * MEDIA CONTROLLER
 * 
 * Handles all media elements including images, videos, and background media
 * Implements lazy loading, performance optimization, and responsive media
 */

export class MediaController {
  constructor(options = {}) {
    this.options = {
      lazyLoadOffset: options.lazyLoadOffset || '50px',
      videoAutoplay: options.videoAutoplay !== false,
      imageQuality: options.imageQuality || 0.8,
      enableWebP: options.enableWebP !== false,
      preloadCritical: options.preloadCritical !== false,
      ...options
    };
    
    this.mediaElements = new Map();
    this.observers = new Map();
    this.loadedMedia = new Set();
    this.videoPlayers = new Map();
    
    // Bind methods
    this.handleIntersection = this.handleIntersection.bind(this);
    this.handleVideoIntersection = this.handleVideoIntersection.bind(this);
  }
  
  /**
   * Initialize the media controller
   */
  async init() {
    try {
      // Discover all media elements
      await this.discoverMedia();
      
      // Set up intersection observers
      this.setupIntersectionObservers();
      
      // Set up video players
      this.setupVideoPlayers();
      
      // Preload critical media
      if (this.options.preloadCritical) {
        await this.preloadCriticalMedia();
      }
      
      // Set up responsive image handling
      this.setupResponsiveImages();
      
      console.log(`MediaController initialized with ${this.mediaElements.size} media elements`);
      
    } catch (error) {
      console.error('Failed to initialize MediaController:', error);
      throw error;
    }
  }
  
  /**
   * Discover all media elements in the DOM
   */
  async discoverMedia() {
    // Images
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"], .background-image');
    images.forEach(img => this.registerMediaElement(img, 'image'));
    
    // Videos
    const videos = document.querySelectorAll('video');
    videos.forEach(video => this.registerMediaElement(video, 'video'));
    
    // Background videos
    const bgVideos = document.querySelectorAll('.hero-video, [data-bg-video]');
    bgVideos.forEach(video => this.registerMediaElement(video, 'background-video'));
    
    // Picture elements
    const pictures = document.querySelectorAll('picture');
    pictures.forEach(picture => this.registerMediaElement(picture, 'picture'));
  }
  
  /**
   * Register a media element
   */
  registerMediaElement(element, type) {
    const id = this.generateMediaId(element);
    
    const mediaData = {
      id,
      element,
      type,
      loaded: false,
      loading: false,
      error: false,
      src: this.getMediaSource(element, type),
      fallbackSrc: this.getFallbackSource(element, type),
      isVisible: false,
      priority: this.getMediaPriority(element),
      responsive: this.isResponsiveMedia(element)
    };
    
    this.mediaElements.set(id, mediaData);
    
    // Add data attribute for tracking
    element.dataset.mediaId = id;
  }
  
  /**
   * Generate unique ID for media element
   */
  generateMediaId(element) {
    return element.id || 
           element.dataset.mediaId || 
           `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get media source URL
   */
  getMediaSource(element, type) {
    switch (type) {
      case 'image':
        return element.dataset.src || element.src;
      case 'video':
      case 'background-video':
        return element.dataset.src || element.src || this.getVideoSources(element)[0];
      case 'picture':
        const img = element.querySelector('img');
        return img ? (img.dataset.src || img.src) : null;
      default:
        return null;
    }
  }
  
  /**
   * Get fallback source
   */
  getFallbackSource(element, type) {
    return element.dataset.fallback || null;
  }
  
  /**
   * Get video sources
   */
  getVideoSources(videoElement) {
    const sources = Array.from(videoElement.querySelectorAll('source'));
    return sources.map(source => source.src).filter(Boolean);
  }
  
  /**
   * Get media priority (higher number = higher priority)
   */
  getMediaPriority(element) {
    // Critical media (above fold, hero sections)
    if (element.closest('.hero-section')) return 10;
    if (element.dataset.priority) return parseInt(element.dataset.priority);
    
    // Check if element is in viewport initially
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight) return 5;
    
    return 1; // Default priority
  }
  
  /**
   * Check if media should be responsive
   */
  isResponsiveMedia(element) {
    return element.dataset.responsive !== 'false' && 
           !element.classList.contains('no-responsive');
  }
  
  /**
   * Set up intersection observers
   */
  setupIntersectionObservers() {
    // Image lazy loading observer
    const imageObserver = new IntersectionObserver(
      this.handleIntersection,
      {
        rootMargin: this.options.lazyLoadOffset,
        threshold: 0.01
      }
    );
    
    // Video autoplay observer
    const videoObserver = new IntersectionObserver(
      this.handleVideoIntersection,
      {
        rootMargin: '0px',
        threshold: 0.5
      }
    );
    
    // Observe media elements
    this.mediaElements.forEach(media => {
      if (media.type === 'video' || media.type === 'background-video') {
        videoObserver.observe(media.element);
      } else {
        imageObserver.observe(media.element);
      }
    });
    
    this.observers.set('images', imageObserver);
    this.observers.set('videos', videoObserver);
  }
  
  /**
   * Handle intersection for lazy loading
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const mediaId = entry.target.dataset.mediaId;
        const media = this.mediaElements.get(mediaId);
        
        if (media && !media.loaded && !media.loading) {
          this.loadMedia(media);
        }
      }
    });
  }
  
  /**
   * Handle video intersection for autoplay
   */
  handleVideoIntersection(entries) {
    entries.forEach(entry => {
      const mediaId = entry.target.dataset.mediaId;
      const media = this.mediaElements.get(mediaId);
      
      if (!media || media.type !== 'video' && media.type !== 'background-video') return;
      
      if (entry.isIntersecting) {
        this.playVideo(media);
      } else {
        this.pauseVideo(media);
      }
    });
  }
  
  /**
   * Load media element
   */
  async loadMedia(media) {
    if (media.loading || media.loaded) return;
    
    media.loading = true;
    
    try {
      switch (media.type) {
        case 'image':
          await this.loadImage(media);
          break;
        case 'video':
        case 'background-video':
          await this.loadVideo(media);
          break;
        case 'picture':
          await this.loadPicture(media);
          break;
      }
      
      media.loaded = true;
      media.loading = false;
      this.loadedMedia.add(media.id);
      
      // Trigger loaded event
      this.dispatchMediaEvent('loaded', media);
      
    } catch (error) {
      console.error(`Failed to load media ${media.id}:`, error);
      media.error = true;
      media.loading = false;
      
      // Try fallback if available
      if (media.fallbackSrc) {
        await this.loadFallback(media);
      }
      
      this.dispatchMediaEvent('error', media);
    }
  }
  
  /**
   * Load image
   */
  async loadImage(media) {
    return new Promise((resolve, reject) => {
      const img = media.element;
      const src = media.src;
      
      if (!src) {
        reject(new Error('No source URL provided'));
        return;
      }
      
      // Create new image for preloading
      const preloadImg = new Image();
      
      preloadImg.onload = () => {
        // Apply loaded image
        if (img.tagName === 'IMG') {
          img.src = src;
        } else {
          // Background image
          img.style.backgroundImage = `url(${src})`;
        }
        
        // Add loaded class for CSS transitions
        img.classList.add('media-loaded');
        
        resolve();
      };
      
      preloadImg.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      // Start loading
      preloadImg.src = src;
    });
  }
  
  /**
   * Load video
   */
  async loadVideo(media) {
    return new Promise((resolve, reject) => {
      const video = media.element;
      
      // Set up video attributes
      if (media.type === 'background-video') {
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
      }
      
      video.addEventListener('loadeddata', () => {
        video.classList.add('media-loaded');
        resolve();
      }, { once: true });
      
      video.addEventListener('error', () => {
        reject(new Error(`Failed to load video: ${media.src}`));
      }, { once: true });
      
      // Load video
      if (media.src && !video.src) {
        video.src = media.src;
      }
      video.load();
    });
  }
  
  /**
   * Load picture element
   */
  async loadPicture(media) {
    const picture = media.element;
    const img = picture.querySelector('img');
    
    if (!img) {
      throw new Error('No img element found in picture');
    }
    
    // Update the media reference to the img element
    media.element = img;
    media.type = 'image';
    
    return this.loadImage(media);
  }
  
  /**
   * Load fallback media
   */
  async loadFallback(media) {
    const originalSrc = media.src;
    media.src = media.fallbackSrc;
    
    try {
      await this.loadMedia(media);
      console.log(`Loaded fallback for ${media.id}`);
    } catch (error) {
      console.error(`Fallback also failed for ${media.id}:`, error);
      media.src = originalSrc; // Restore original
    }
  }
  
  /**
   * Set up video players
   */
  setupVideoPlayers() {
    this.mediaElements.forEach(media => {
      if (media.type === 'video' || media.type === 'background-video') {
        this.setupVideoPlayer(media);
      }
    });
  }
  
  /**
   * Set up individual video player
   */
  setupVideoPlayer(media) {
    const video = media.element;
    
    // Create player controls if needed
    if (media.type === 'video' && !video.controls) {
      this.createCustomControls(media);
    }
    
    // Set up event listeners
    video.addEventListener('play', () => {
      this.dispatchMediaEvent('play', media);
    });
    
    video.addEventListener('pause', () => {
      this.dispatchMediaEvent('pause', media);
    });
    
    video.addEventListener('ended', () => {
      this.dispatchMediaEvent('ended', media);
    });
    
    this.videoPlayers.set(media.id, {
      media,
      isPlaying: false,
      currentTime: 0
    });
  }
  
  /**
   * Create custom video controls
   */
  createCustomControls(media) {
    const video = media.element;
    const container = video.parentElement;
    
    // Create controls container
    const controls = document.createElement('div');
    controls.className = 'video-controls';
    controls.innerHTML = `
      <button class="play-pause-btn" aria-label="Play/Pause">
        <svg class="play-icon" viewBox="0 0 24 24" width="24" height="24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg class="pause-icon" viewBox="0 0 24 24" width="24" height="24" style="display: none;">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="time-display">
        <span class="current-time">0:00</span> / <span class="duration">0:00</span>
      </div>
    `;
    
    container.appendChild(controls);
    
    // Set up control interactions
    this.setupVideoControlInteractions(media, controls);
  }
  
  /**
   * Set up video control interactions
   */
  setupVideoControlInteractions(media, controls) {
    const video = media.element;
    const playPauseBtn = controls.querySelector('.play-pause-btn');
    const progressBar = controls.querySelector('.progress-bar');
    const progressFill = controls.querySelector('.progress-fill');
    const currentTimeSpan = controls.querySelector('.current-time');
    const durationSpan = controls.querySelector('.duration');
    
    // Play/pause button
    playPauseBtn.addEventListener('click', () => {
      if (video.paused) {
        this.playVideo(media);
      } else {
        this.pauseVideo(media);
      }
    });
    
    // Progress bar
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      video.currentTime = video.duration * percentage;
    });
    
    // Time updates
    video.addEventListener('timeupdate', () => {
      const percentage = (video.currentTime / video.duration) * 100;
      progressFill.style.width = `${percentage}%`;
      currentTimeSpan.textContent = this.formatTime(video.currentTime);
    });
    
    video.addEventListener('loadedmetadata', () => {
      durationSpan.textContent = this.formatTime(video.duration);
    });
    
    // Update play/pause icons
    video.addEventListener('play', () => {
      controls.querySelector('.play-icon').style.display = 'none';
      controls.querySelector('.pause-icon').style.display = 'block';
    });
    
    video.addEventListener('pause', () => {
      controls.querySelector('.play-icon').style.display = 'block';
      controls.querySelector('.pause-icon').style.display = 'none';
    });
  }
  
  /**
   * Format time for display
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Play video
   */
  async playVideo(media) {
    const video = media.element;
    const player = this.videoPlayers.get(media.id);
    
    if (!player || player.isPlaying) return;
    
    try {
      // Ensure video is loaded
      if (!media.loaded) {
        await this.loadMedia(media);
      }
      
      // Play video
      await video.play();
      player.isPlaying = true;
      
    } catch (error) {
      console.warn(`Failed to play video ${media.id}:`, error);
    }
  }
  
  /**
   * Pause video
   */
  pauseVideo(media) {
    const video = media.element;
    const player = this.videoPlayers.get(media.id);
    
    if (!player || !player.isPlaying) return;
    
    video.pause();
    player.isPlaying = false;
  }
  
  /**
   * Set up responsive images
   */
  setupResponsiveImages() {
    // Handle window resize for responsive images
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.updateResponsiveImages();
      }, 250);
    });
    
    // Initial update
    this.updateResponsiveImages();
  }
  
  /**
   * Update responsive images based on viewport
   */
  updateResponsiveImages() {
    const viewportWidth = window.innerWidth;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    this.mediaElements.forEach(media => {
      if (media.responsive && media.type === 'image' && media.loaded) {
        this.updateImageForViewport(media, viewportWidth, devicePixelRatio);
      }
    });
  }
  
  /**
   * Update image for current viewport
   */
  updateImageForViewport(media, viewportWidth, devicePixelRatio) {
    const img = media.element;
    const baseSrc = media.src;
    
    // Generate responsive src based on viewport
    const responsiveSrc = this.generateResponsiveSrc(baseSrc, viewportWidth, devicePixelRatio);
    
    if (responsiveSrc !== img.src) {
      img.src = responsiveSrc;
    }
  }
  
  /**
   * Generate responsive image source
   */
  generateResponsiveSrc(baseSrc, viewportWidth, devicePixelRatio) {
    // This would typically integrate with a CDN or image service
    // For now, return the base source
    return baseSrc;
  }
  
  /**
   * Preload critical media
   */
  async preloadCriticalMedia() {
    const criticalMedia = Array.from(this.mediaElements.values())
      .filter(media => media.priority >= 5)
      .sort((a, b) => b.priority - a.priority);
    
    const preloadPromises = criticalMedia.map(media => this.loadMedia(media));
    
    try {
      await Promise.all(preloadPromises);
      console.log(`Preloaded ${criticalMedia.length} critical media elements`);
    } catch (error) {
      console.warn('Some critical media failed to preload:', error);
    }
  }
  
  /**
   * Dispatch media event
   */
  dispatchMediaEvent(eventType, media) {
    const event = new CustomEvent(`media:${eventType}`, {
      detail: { media, mediaId: media.id }
    });
    
    media.element.dispatchEvent(event);
    document.dispatchEvent(event);
  }
  
  /**
   * Get media by ID
   */
  getMedia(id) {
    return this.mediaElements.get(id);
  }
  
  /**
   * Get all loaded media
   */
  getLoadedMedia() {
    return Array.from(this.mediaElements.values()).filter(media => media.loaded);
  }
  
  /**
   * Get loading progress
   */
  getLoadingProgress() {
    const total = this.mediaElements.size;
    const loaded = this.loadedMedia.size;
    return total > 0 ? loaded / total : 1;
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    this.updateResponsiveImages();
  }
  
  /**
   * Start the media controller
   */
  start() {
    // Trigger initial loading for visible media
    this.mediaElements.forEach(media => {
      const rect = media.element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        this.loadMedia(media);
      }
    });
  }
  
  /**
   * Destroy the media controller
   */
  destroy() {
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Pause all videos
    this.videoPlayers.forEach(player => {
      this.pauseVideo(player.media);
    });
    this.videoPlayers.clear();
    
    // Clear media elements
    this.mediaElements.clear();
    this.loadedMedia.clear();
    
    console.log('MediaController destroyed');
  }
}