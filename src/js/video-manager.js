/**
 * Video Manager - Handles embedded videos from various sources
 */

class VideoManager {
  constructor() {
    this.initializeVideoContainers();
    this.setupVideoThumbnails();
  }

  /**
   * Initialize video containers and load content
   */
  async initializeVideoContainers() {
    try {
      const response = await fetch('/content/videos.json');
      const videoData = await response.json();
      
      this.loadSuccessStoriesVideo(videoData.successStories);
      this.loadMethodologyVideo(videoData.methodology);
      this.loadLeadershipVideo(videoData.leadership);
    } catch (error) {
      console.error('Error loading video data:', error);
    }
  }

  /**
   * Load success stories video section
   */
  loadSuccessStoriesVideo(data) {
    const container = document.querySelector('#success-video .video-container');
    if (!container || !data.featured) return;

    const videoElement = this.createVideoElement(data.featured);
    container.innerHTML = '';
    container.appendChild(videoElement);

    // Load video thumbnails
    this.loadVideoThumbnails('#success-video .video-gallery', data.gallery);
  }

  /**
   * Load methodology video section
   */
  loadMethodologyVideo(data) {
    const container = document.querySelector('#methodology-video .video-container');
    if (!container || !data.featured) return;

    const videoElement = this.createVideoElement(data.featured);
    container.innerHTML = '';
    container.appendChild(videoElement);
  }

  /**
   * Load leadership video section
   */
  loadLeadershipVideo(data) {
    const container = document.querySelector('#leadership-video .video-container');
    if (!container || !data.featured) return;

    const videoElement = this.createVideoElement(data.featured);
    container.innerHTML = '';
    container.appendChild(videoElement);
  }

  /**
   * Create video element based on source type
   */
  createVideoElement(videoData) {
    // Priority: embedCode > youtubeId > vimeoId > fallback
    if (videoData.embedCode && videoData.embedCode.trim()) {
      return this.createEmbedContainer(videoData.embedCode, videoData.description);
    } else if (videoData.youtubeId && videoData.youtubeId.trim()) {
      return this.createYouTubeEmbed(videoData.youtubeId, videoData.description);
    } else if (videoData.vimeoId && videoData.vimeoId.trim()) {
      return this.createVimeoEmbed(videoData.vimeoId, videoData.description);
    } else {
      return this.createPlaceholderVideo(videoData);
    }
  }

  /**
   * Create container for custom embed code
   */
  createEmbedContainer(embedCode, description) {
    const container = document.createElement('div');
    container.className = 'video-embed-container';
    container.setAttribute('aria-label', description || 'Embedded video');
    container.innerHTML = embedCode;
    return container;
  }

  /**
   * Create YouTube embed
   */
  createYouTubeEmbed(videoId, description) {
    const container = document.createElement('div');
    container.className = 'video-embed-container youtube-embed';
    
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.setAttribute('aria-label', description || 'YouTube video');
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    
    container.appendChild(iframe);
    return container;
  }

  /**
   * Create Vimeo embed
   */
  createVimeoEmbed(videoId, description) {
    const container = document.createElement('div');
    container.className = 'video-embed-container vimeo-embed';
    
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${videoId}?playsinline=1`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.setAttribute('aria-label', description || 'Vimeo video');
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    
    container.appendChild(iframe);
    return container;
  }

  /**
   * Create placeholder video element
   */
  createPlaceholderVideo(videoData) {
    const container = document.createElement('div');
    container.className = 'video-placeholder';
    
    const content = `
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <h4>Video Coming Soon</h4>
        <p>${videoData.description || 'Video content will be available here'}</p>
        <small>Add video ID or embed code to videos.json</small>
      </div>
    `;
    
    container.innerHTML = content;
    return container;
  }

  /**
   * Load video thumbnails for gallery
   */
  loadVideoThumbnails(selector, thumbnails) {
    const gallery = document.querySelector(selector);
    if (!gallery || !thumbnails) return;

    gallery.innerHTML = '';
    
    thumbnails.forEach((thumb, index) => {
      const thumbElement = document.createElement('div');
      thumbElement.className = 'video-thumbnail';
      thumbElement.dataset.videoIndex = index;
      
      thumbElement.innerHTML = `
        <img src="${thumb.thumbnail}" alt="${thumb.title}" loading="lazy">
        <div class="play-overlay">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div class="thumb-info">
          <h5>${thumb.title}</h5>
          <p>${thumb.description}</p>
        </div>
      `;
      
      // Add click handler
      thumbElement.addEventListener('click', () => {
        this.playThumbnailVideo(thumb);
      });
      
      gallery.appendChild(thumbElement);
    });
  }

  /**
   * Play video from thumbnail click
   */
  playThumbnailVideo(videoData) {
    const modal = this.createVideoModal(videoData);
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => modal.classList.add('visible'), 10);
    
    // Handle close
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
      modal.classList.remove('visible');
      setTimeout(() => document.body.removeChild(modal), 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  /**
   * Create video modal for thumbnails
   */
  createVideoModal(videoData) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    
    const videoElement = this.createVideoElement(videoData);
    
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close" aria-label="Close video">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <div class="modal-video"></div>
        <div class="modal-info">
          <h4>${videoData.title}</h4>
          <p>${videoData.description}</p>
        </div>
      </div>
    `;
    
    modal.querySelector('.modal-video').appendChild(videoElement);
    return modal;
  }

  /**
   * Setup existing video thumbnails
   */
  setupVideoThumbnails() {
    const thumbnails = document.querySelectorAll('.video-thumbnail');
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const videoId = thumb.dataset.video;
        console.log(`Play video: ${videoId}`);
        // Handle existing video thumbnail clicks
      });
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VideoManager();
});

export default VideoManager;