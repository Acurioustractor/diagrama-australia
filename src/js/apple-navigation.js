/**
 * Apple-style Navigation Controller
 * Handles minimal, elegant navigation behavior
 */

class AppleNavigation {
  constructor() {
    this.nav = document.querySelector('.main-nav');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.isVisible = false;
    this.isMobile = window.innerWidth <= 768;
    this.scrollPosition = 0;
    this.scrollDirection = 'up';
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.handleScroll();
    this.setActiveLink();
  }
  
  setupEventListeners() {
    // Scroll events for showing/hiding nav
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    // Mobile toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => {
        this.toggleMobileNav();
      });
    }
    
    // Nav link clicks
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleNavClick(e, link);
      });
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile && this.nav.classList.contains('mobile-open')) {
        this.hideMobileNav();
      }
    });
    
    // Close mobile nav on outside click
    document.addEventListener('click', (e) => {
      if (this.isMobile && this.isVisible && 
          !this.nav.contains(e.target) && 
          !this.navToggle.contains(e.target)) {
        this.hideMobileNav();
      }
    });
    
    // Intersection observer for section changes
    this.setupIntersectionObserver();
  }
  
  handleScroll() {
    const currentScroll = window.pageYOffset;
    const scrollDelta = currentScroll - this.scrollPosition;
    
    // Determine scroll direction
    if (scrollDelta > 0 && currentScroll > 100) {
      this.scrollDirection = 'down';
    } else if (scrollDelta < 0) {
      this.scrollDirection = 'up';
    }
    
    // Show/hide navigation based on scroll
    if (currentScroll > 200 && this.scrollDirection === 'up' && !this.isVisible) {
      this.showNav();
    } else if (currentScroll <= 100 || this.scrollDirection === 'down') {
      this.hideNav();
    }
    
    this.scrollPosition = currentScroll;
  }
  
  showNav() {
    if (!this.isMobile) {
      this.nav.classList.add('visible');
      this.isVisible = true;
    }
  }
  
  hideNav() {
    if (!this.isMobile && !this.nav.classList.contains('mobile-open')) {
      this.nav.classList.remove('visible');
      this.isVisible = false;
    }
  }
  
  toggleMobileNav() {
    if (this.nav.classList.contains('mobile-open')) {
      this.hideMobileNav();
    } else {
      this.showMobileNav();
    }
  }
  
  showMobileNav() {
    this.nav.classList.add('visible', 'mobile-open');
    this.navToggle.classList.add('active');
    this.isVisible = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
  
  hideMobileNav() {
    this.nav.classList.remove('visible', 'mobile-open');
    this.navToggle.classList.remove('active');
    this.isVisible = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
  
  handleNavClick(e, link) {
    e.preventDefault();
    
    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Smooth scroll to target
      const offsetTop = targetElement.offsetTop - (this.isMobile ? 0 : 80);
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Hide mobile nav after click
      if (this.isMobile) {
        setTimeout(() => {
          this.hideMobileNav();
        }, 300);
      }
      
      // Update active link
      this.setActiveLink(targetId);
    }
  }
  
  setupIntersectionObserver() {
    const sections = document.querySelectorAll('.story-section');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          this.setActiveLink(entry.target.id);
        }
      });
    }, {
      threshold: [0.5],
      rootMargin: '-20% 0px -20% 0px'
    });
    
    sections.forEach(section => {
      observer.observe(section);
    });
  }
  
  setActiveLink(activeId = null) {
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current section link
    if (activeId) {
      const activeLink = document.querySelector(`[href="#${activeId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    } else {
      // Find currently visible section
      const sections = document.querySelectorAll('.story-section');
      const scrollPos = window.pageYOffset + window.innerHeight / 2;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          const activeLink = document.querySelector(`[href="#${section.id}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    }
  }
  
  // Public API
  navigateToSection(sectionId) {
    const link = document.querySelector(`[href="#${sectionId}"]`);
    if (link) {
      this.handleNavClick({ preventDefault: () => {} }, link);
    }
  }
  
  destroy() {
    // Clean up event listeners
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    
    if (this.navToggle) {
      this.navToggle.removeEventListener('click', this.toggleMobileNav);
    }
    
    this.navLinks.forEach(link => {
      link.removeEventListener('click', this.handleNavClick);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AppleNavigation();
});

export default AppleNavigation;