/**
 * Gallery Manager - Loads and displays photo galleries
 */

class GalleryManager {
  constructor() {
    this.galleries = null;
    this.lightboxOpen = false;
    this.currentImageIndex = 0;
    this.currentGallery = null;
    
    this.init();
  }
  
  async init() {
    try {
      await this.loadGalleries();
      this.renderSpainCentersGallery();
      this.renderTeamGallery();
      this.setupLightbox();
    } catch (error) {
      console.error('Error initializing galleries:', error);
    }
  }
  
  async loadGalleries() {
    try {
      const response = await fetch('/content/galleries.json');
      this.galleries = await response.json();
    } catch (error) {
      console.error('Error loading gallery data:', error);
      throw error;
    }
  }
  
  renderSpainCentersGallery() {
    const container = document.querySelector('#spain-gallery .gallery-grid');
    if (!container || !this.galleries?.spainCenters) return;
    
    container.innerHTML = '';
    
    this.galleries.spainCenters.images.forEach((image, index) => {
      const galleryItem = document.createElement('div');
      galleryItem.className = `gallery-item ${image.isLarge ? 'large' : ''}`;
      galleryItem.dataset.galleryIndex = index;
      galleryItem.dataset.gallery = 'spainCenters';
      
      galleryItem.innerHTML = `
        <img src="${image.src}" alt="${image.alt}" loading="lazy">
        <div class="gallery-overlay">
          <h4>${image.title}</h4>
          <p>${image.description}</p>
        </div>
      `;
      
      // Add click handler for lightbox
      galleryItem.addEventListener('click', () => {
        this.openLightbox('spainCenters', index);
      });
      
      container.appendChild(galleryItem);
    });
  }
  
  renderTeamGallery() {
    const container = document.querySelector('#team-gallery .team-grid');
    if (!container || !this.galleries?.team) return;
    
    container.innerHTML = '';
    
    this.galleries.team.members.forEach((member, index) => {
      const teamMember = document.createElement('div');
      teamMember.className = 'team-member';
      teamMember.dataset.animate = 'slide-up';
      
      teamMember.innerHTML = `
        <div class="member-photo">
          <img src="${member.photo}" alt="${member.name}" loading="lazy">
        </div>
        <div class="member-info">
          <h4>${member.name}</h4>
          <p class="member-role">${member.role}</p>
          <p class="member-description">${member.description}</p>
        </div>
      `;
      
      container.appendChild(teamMember);
    });
    
    // Update section titles if they exist
    const titleElement = document.querySelector('#team-gallery .section-title');
    const subtitleElement = document.querySelector('#team-gallery .section-subtitle');
    
    if (titleElement) titleElement.textContent = this.galleries.team.title;
    if (subtitleElement) subtitleElement.textContent = this.galleries.team.subtitle;
  }
  
  setupLightbox() {
    // Create lightbox HTML
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-overlay"></div>
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close lightbox">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <button class="lightbox-prev" aria-label="Previous image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button class="lightbox-next" aria-label="Next image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        <div class="lightbox-image-container">
          <img class="lightbox-image" src="" alt="">
        </div>
        <div class="lightbox-info">
          <h3 class="lightbox-title"></h3>
          <p class="lightbox-description"></p>
          <div class="lightbox-counter"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Setup event listeners
    const overlay = lightbox.querySelector('.lightbox-overlay');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    overlay.addEventListener('click', () => this.closeLightbox());
    closeBtn.addEventListener('click', () => this.closeLightbox());
    prevBtn.addEventListener('click', () => this.previousImage());
    nextBtn.addEventListener('click', () => this.nextImage());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.previousImage();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
      }
    });
  }
  
  openLightbox(galleryType, imageIndex) {
    const lightbox = document.querySelector('.gallery-lightbox');
    const gallery = this.galleries[galleryType];
    
    if (!lightbox || !gallery) return;
    
    this.currentGallery = galleryType;
    this.currentImageIndex = imageIndex;
    this.lightboxOpen = true;
    
    this.updateLightboxContent();
    
    lightbox.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  
  closeLightbox() {
    const lightbox = document.querySelector('.gallery-lightbox');
    if (!lightbox) return;
    
    lightbox.classList.remove('visible');
    document.body.style.overflow = '';
    this.lightboxOpen = false;
  }
  
  nextImage() {
    if (!this.currentGallery) return;
    
    const gallery = this.galleries[this.currentGallery];
    const images = gallery.images || gallery.members;
    
    this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
    this.updateLightboxContent();
  }
  
  previousImage() {
    if (!this.currentGallery) return;
    
    const gallery = this.galleries[this.currentGallery];
    const images = gallery.images || gallery.members;
    
    this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
    this.updateLightboxContent();
  }
  
  updateLightboxContent() {
    const lightbox = document.querySelector('.gallery-lightbox');
    if (!lightbox || !this.currentGallery) return;
    
    const gallery = this.galleries[this.currentGallery];
    const images = gallery.images || gallery.members;
    const currentItem = images[this.currentImageIndex];
    
    if (!currentItem) return;
    
    const image = lightbox.querySelector('.lightbox-image');
    const title = lightbox.querySelector('.lightbox-title');
    const description = lightbox.querySelector('.lightbox-description');
    const counter = lightbox.querySelector('.lightbox-counter');
    
    // Handle different data structures
    const imageSrc = currentItem.src || currentItem.photo;
    const imageAlt = currentItem.alt || currentItem.name;
    const imageTitle = currentItem.title || currentItem.name;
    const imageDesc = currentItem.description || currentItem.bio;
    
    image.src = imageSrc;
    image.alt = imageAlt;
    title.textContent = imageTitle;
    description.textContent = imageDesc;
    counter.textContent = `${this.currentImageIndex + 1} / ${images.length}`;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GalleryManager();
});

export default GalleryManager;