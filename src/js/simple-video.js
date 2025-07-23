/**
 * Simple Video Loader
 */

class SimpleVideoLoader {
  constructor() {
    this.init();
  }
  
  async init() {
    try {
      const response = await fetch('/content/videos.json');
      const videos = await response.json();
      
      this.loadSuccessVideo(videos.successStories);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  }
  
  loadSuccessVideo(video) {
    const container = document.querySelector('#success-video .video-container');
    if (!container || !video.featured) return;
    
    if (video.featured.embedCode) {
      container.innerHTML = `
        <div class="video-embed-container">
          ${video.featured.embedCode}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="video-placeholder">
          <div class="placeholder-content">
            <h4>Video Coming Soon</h4>
            <p>Add video embed code to videos.json</p>
          </div>
        </div>
      `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SimpleVideoLoader();
});

export default SimpleVideoLoader;