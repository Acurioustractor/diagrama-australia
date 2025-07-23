# Diagrama Scrollytelling Framework

A modern, accessible, and performant scrollytelling framework built for the Diagrama Australia presentation. This framework transforms static presentations into dynamic, interactive storytelling experiences with smooth animations, media integration, and comprehensive accessibility features.

## 🌟 Features

### Core Functionality
- **Modern Scrollytelling**: Intersection Observer-based scroll detection with smooth animations
- **Mixed Media Support**: Images, videos, and interactive elements with lazy loading
- **Responsive Design**: Desktop-first with mobile adaptations
- **Accessibility First**: WCAG compliant with screen reader support and keyboard navigation
- **Performance Optimized**: Efficient animations, lazy loading, and code splitting

### Technical Highlights
- **Modular Architecture**: Clean separation of concerns with dedicated controllers
- **GSAP Integration**: Smooth, performant animations with CSS fallbacks
- **Content Management**: Easy content updates through JSON configuration
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Cross-browser Support**: Modern browsers with graceful degradation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd diagrama-presentation
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

4. **Preview production build:**
```bash
npm run preview
```

## 📁 Project Structure

```
diagrama-presentation/
├── src/
│   ├── js/                          # JavaScript modules
│   │   ├── main.js                  # Main application entry
│   │   ├── scrollytelling-engine.js # Core scroll detection & animations
│   │   ├── animation-controller.js  # GSAP animation management
│   │   ├── media-controller.js      # Image/video handling & lazy loading
│   │   ├── navigation-controller.js # Keyboard & URL navigation
│   │   ├── progress-indicator.js    # Scroll progress & section tracking
│   │   ├── accessibility-controller.js # WCAG compliance & screen readers
│   │   └── content-manager.js       # Dynamic content management
│   ├── styles/
│   │   └── main.css                 # Main stylesheet with design system
│   └── utils/                       # Utility functions
├── assets/
│   ├── images/                      # Image assets
│   ├── videos/                      # Video assets
│   ├── icons/                       # Icon assets
│   └── fonts/                       # Font assets
├── content/                         # Content JSON files
├── index.html                       # Main HTML file
├── package.json                     # Dependencies & scripts
├── vite.config.js                   # Vite configuration
└── README.md                        # This file
```

## 🎨 Design System

### Color Palette
The framework uses an emotional journey color palette:

- **Primary Colors**: Deep blues and teals representing trust and transformation
- **Crisis Colors**: Dark reds representing urgency and problems
- **Hope Colors**: Bright teals and greens representing solutions and success
- **Accent Colors**: Warm oranges and golds for highlights and success metrics

### Typography
- **Primary Font**: Inter (modern sans-serif)
- **Secondary Font**: Playfair Display (elegant serif for headings)
- **Monospace Font**: JetBrains Mono (for code and data)

### Responsive Breakpoints
- **Desktop**: 1024px and above (primary focus)
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

## 🔧 Configuration

### Main Configuration
The main application can be configured in `src/js/main.js`:

```javascript
const app = new DiagramaApp({
  // Animation settings
  animationDuration: 0.8,
  animationEasing: 'power2.out',
  
  // Scroll settings
  scrollThreshold: 0.2,
  
  // Accessibility
  respectReducedMotion: true,
  keyboardNavigation: true,
  
  // Performance
  enableGPUAcceleration: true
});
```

### Content Management
Content is managed through JSON files in the `content/` directory:

```json
{
  "title": "Section Title",
  "subtitle": "Section Subtitle",
  "content": "Main content text",
  "media": {
    "background": "background-image.jpg",
    "video": "section-video.mp4"
  }
}
```

## 🎯 Usage Guide

### Adding New Sections

1. **Update HTML structure:**
```html
<section id="new-section" class="story-section" data-section-type="custom">
  <div class="section-content">
    <header class="section-header">
      <h2 class="section-title">New Section</h2>
      <p class="section-subtitle">Section description</p>
    </header>
    <!-- Section content -->
  </div>
</section>
```

2. **Add content JSON:**
```json
// content/new-section.json
{
  "title": "New Section Title",
  "subtitle": "Section subtitle",
  "content": "Section content..."
}
```

3. **Update navigation:**
```html
<a href="#new-section" class="nav-link">New Section</a>
```

### Adding Animations

Use data attributes to trigger animations:

```html
<div data-animate="fade-up" data-animate-delay="0.2">
  Content that fades up on scroll
</div>
```

Available animation types:
- `fade-up`, `fade-down`, `fade-left`, `fade-right`
- `slide-up`, `slide-down`, `slide-left`, `slide-right`
- `scale-in`, `counter`, `timeline`, `reveal`

### Media Integration

#### Images with Lazy Loading
```html
<img data-src="image.jpg" alt="Description" loading="lazy" class="lazy-image">
```

#### Background Videos
```html
<video class="hero-video" autoplay muted loop playsinline>
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
</video>
```

#### Responsive Images
```html
<picture>
  <source media="(min-width: 1024px)" srcset="image-large.jpg">
  <source media="(min-width: 768px)" srcset="image-medium.jpg">
  <img src="image-small.jpg" alt="Description">
</picture>
```

## ♿ Accessibility Features

### Built-in Accessibility
- **Screen Reader Support**: Proper ARIA labels and live regions
- **Keyboard Navigation**: Full keyboard accessibility with logical tab order
- **Focus Management**: Clear focus indicators and focus trapping
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast**: Alternative color schemes for visual accessibility

### Keyboard Shortcuts
- **Arrow Keys / Space**: Navigate between sections
- **Home / End**: Jump to first/last section
- **Escape**: Focus main navigation
- **F6**: Cycle through page landmarks
- **Ctrl/Cmd + H**: Cycle through headings
- **Ctrl/Cmd + 1-9**: Jump to specific sections

### Screen Reader Announcements
The framework automatically announces:
- Section changes during navigation
- Loading states and progress
- Interactive element descriptions
- Error messages and status updates

## 🚀 Performance Optimization

### Built-in Optimizations
- **Lazy Loading**: Images and videos load only when needed
- **Code Splitting**: JavaScript modules load on demand
- **Asset Optimization**: Compressed images and minified code
- **Efficient Animations**: RequestAnimationFrame-based animations
- **Intersection Observer**: Efficient scroll detection

### Performance Monitoring
The framework includes built-in performance monitoring:

```javascript
// Performance metrics are logged in development
console.log('Animation duration: 16ms');
console.log('Scroll handler execution: 2ms');
```

## 🔧 Development

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build
npm run serve
```

### Hot Reload
The framework supports hot module replacement (HMR) for:
- CSS changes (instant updates)
- JavaScript modules (preserves state)
- Content JSON files (automatic reload)

### Debugging
Enable debug mode by adding to localStorage:
```javascript
localStorage.setItem('diagrama-debug', 'true');
```

This enables:
- Detailed console logging
- Performance metrics
- Animation debugging
- Accessibility announcements

## 🌐 Browser Support

### Supported Browsers
- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

### Required Features
- Intersection Observer API
- ES6 Modules
- CSS Grid and Flexbox
- RequestAnimationFrame

### Graceful Degradation
- CSS animations fallback for GSAP
- Static content for JavaScript failures
- Alternative navigation for keyboard-only users

## 📱 Mobile Considerations

### Mobile Optimizations
- **Touch-friendly**: Large touch targets and swipe gestures
- **Performance**: Reduced animations and optimized assets
- **Viewport**: Proper viewport meta tag and responsive design
- **Accessibility**: Voice control and screen reader support

### Mobile-specific Features
- Swipe navigation between sections
- Reduced motion by default
- Optimized image sizes
- Touch-friendly video controls

## 🔒 Security

### Content Security Policy
Recommended CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:;
```

### Asset Security
- All assets served over HTTPS
- No external dependencies in production
- Sanitized content inputs
- Secure media loading

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across browsers
5. Submit a pull request

### Code Style
- Use ESLint configuration
- Follow accessibility guidelines
- Write semantic HTML
- Use CSS custom properties
- Document complex functions

### Testing
- Test keyboard navigation
- Verify screen reader compatibility
- Check performance metrics
- Validate across browsers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **GSAP**: For smooth, performant animations
- **Intersection Observer**: For efficient scroll detection
- **Vite**: For fast development and building
- **Web Accessibility Initiative**: For accessibility guidelines

## 📞 Support

For questions, issues, or contributions:

- **Kate Bjur**: kate.bjur@diagramaaustralia.org
- **Benjamin Knight**: ben.knight@diagramaaustralia.org

---

**Built with ❤️ for transforming youth justice through technology**