/**
 * Simple Main JavaScript - Just loads content
 */

// Simple scroll progress
function setupScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;
  
  function updateProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
  }
  
  window.addEventListener('scroll', updateProgress);
  updateProgress();
}

// Simple navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mainNav.classList.toggle('mobile-open');
      mainNav.classList.toggle('mobile-closed');
    });
  }
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        
        // Close mobile menu if open
        if (mainNav.classList.contains('mobile-open')) {
          navToggle.classList.remove('active');
          mainNav.classList.remove('mobile-open');
          mainNav.classList.add('mobile-closed');
        }
      }
    });
  });
  
  // Initialize mobile menu state
  function initializeMobileState() {
    if (window.innerWidth <= 768) {
      mainNav.classList.add('mobile-closed');
      mainNav.classList.remove('mobile-open');
    } else {
      mainNav.classList.remove('mobile-closed', 'mobile-open');
      navToggle.classList.remove('active');
    }
  }
  
  initializeMobileState();
  
  // Handle window resize
  window.addEventListener('resize', initializeMobileState);
}

// Load gallery content
async function loadGalleries() {
  try {
    const response = await fetch('/content/galleries.json');
    const galleries = await response.json();
    
    // Load Spain gallery with improved layout
    const spainContainer = document.querySelector('#spain-gallery .gallery-grid');
    if (spainContainer && galleries.spainCenters) {
      spainContainer.innerHTML = '';
      galleries.spainCenters.images.forEach((image, index) => {
        const item = document.createElement('div');
        
        // Create better masonry layout with varying sizes
        let gridClass = 'gallery-item';
        let gridRowSpan = '';
        
        if (image.size === 'large' || index === 0) {
          gridRowSpan = 'grid-row: span 2;';
          gridClass += ' large';
        } else if (index % 4 === 1) {
          gridRowSpan = 'grid-row: span 1;';
        } else if (index % 3 === 0) {
          gridRowSpan = 'grid-row: span 1;';
        }
        
        item.className = gridClass;
        item.style.cssText = `
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          ${gridRowSpan}
        `;
        
        item.innerHTML = `
          <img src="${image.src}" alt="${image.alt}" loading="lazy" style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          ">
          <div class="gallery-overlay" style="
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            color: white;
            padding: 2rem 1.5rem 1.5rem;
            transform: translateY(0);
            transition: all 0.3s ease;
          ">
            <h4 style="
              font-size: 1.2rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: #ffffff;
            ">${image.title}</h4>
            <p style="
              font-size: 0.9rem;
              line-height: 1.4;
              margin: 0;
              color: rgba(255,255,255,0.9);
            ">${image.description}</p>
          </div>
        `;
        
        // Add hover effect
        item.addEventListener('mouseenter', () => {
          item.style.transform = 'translateY(-4px)';
          item.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.transform = 'translateY(0)';
          item.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
        });
        
        spainContainer.appendChild(item);
      });
    }
    
    // Load team gallery
    const teamContainer = document.querySelector('#team-gallery .team-grid');
    if (teamContainer && galleries.team) {
      teamContainer.innerHTML = '';
      galleries.team.members.forEach(member => {
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
        teamContainer.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error loading galleries:', error);
  }
}

// Load video content
async function loadVideos() {
  try {
    const response = await fetch('/content/videos.json');
    const videos = await response.json();
    
    // Load success stories featured video
    const videoContainer = document.querySelector('#success-video .video-container');
    if (videoContainer && videos.successStories?.featured?.embedCode) {
      videoContainer.innerHTML = `
        <div class="video-embed-container">
          ${videos.successStories.featured.embedCode}
        </div>
      `;
    }
    
    // Load CEO video from gallery if available  
    const ceoVideoContainer = document.querySelector('.video-gallery .video-embed-container');
    const ceoVideo = videos.successStories?.gallery?.find(video => video.title.includes('CEO'));
    console.log('CEO video container:', ceoVideoContainer);
    console.log('CEO video data:', ceoVideo);
    
    if (ceoVideoContainer && ceoVideo?.embedCode) {
      console.log('Loading CEO video with embed code:', ceoVideo.embedCode);
      // Insert the embed code and style the iframe
      ceoVideoContainer.innerHTML = ceoVideo.embedCode;
      const iframe = ceoVideoContainer.querySelector('iframe');
      if (iframe) {
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '8px';
        iframe.style.border = 'none';
      }
    } else {
      console.log('CEO video not found or container missing');
      // Fallback: directly insert the video if container exists
      if (ceoVideoContainer) {
        ceoVideoContainer.innerHTML = '<iframe src="https://share.descript.com/embed/9zQJkrU1zgl" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px; border: none;"></iframe>';
      }
    }
  } catch (error) {
    console.error('Error loading videos:', error);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupScrollProgress();
  setupNavigation();
  loadGalleries();
  loadVideos();
  
  console.log('Diagrama site initialized');
});