/**
 * Content Loader - Loads gallery images dynamically
 */

class ContentLoader {
  constructor() {
    this.init();
  }
  
  async init() {
    try {
      await this.loadGalleryContent();
    } catch (error) {
      console.error('Error loading content:', error);
    }
  }
  
  async loadGalleryContent() {
    try {
      const response = await fetch('/content/galleries.json');
      const galleries = await response.json();
      
      this.renderSpainGallery(galleries.spainCenters);
      this.renderTeamGallery(galleries.team);
    } catch (error) {
      console.error('Error loading galleries:', error);
    }
  }
  
  renderSpainGallery(gallery) {
    const container = document.querySelector('#spain-gallery .gallery-grid');
    if (!container || !gallery) return;
    
    container.innerHTML = '';
    
    gallery.images.forEach((image, index) => {
      const item = document.createElement('div');
      item.className = `gallery-item ${image.isLarge ? 'large' : ''}`;
      
      item.innerHTML = `
        <img src="${image.src}" alt="${image.alt}" loading="lazy">
        <div class="gallery-overlay">
          <h4>${image.title}</h4>
          <p>${image.description}</p>
        </div>
      `;
      
      container.appendChild(item);
    });
  }
  
  renderTeamGallery(gallery) {
    const container = document.querySelector('#team-gallery .team-grid');
    if (!container || !gallery) return;
    
    container.innerHTML = '';
    
    gallery.members.forEach((member) => {
      const item = document.createElement('div');
      item.className = 'team-member';
      
      item.innerHTML = `
        <div class="member-photo">
          <img src="${member.photo}" alt="${member.name}" loading="lazy">
        </div>
        <div class="member-info">
          <h4>${member.name}</h4>
          <p class="member-role">${member.role}</p>
          <p class="member-description">${member.description}</p>
        </div>
      `;
      
      container.appendChild(item);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ContentLoader();
});

export default ContentLoader;