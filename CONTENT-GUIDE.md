# Content Management Guide

This guide explains how to add and manage content for your Diagrama presentation.

## 📹 Adding Videos

### Method 1: YouTube Videos (Recommended)
1. Open `/content/videos.json`
2. Find the section you want to add video to (successStories, methodology, or leadership)
3. Add the YouTube video ID:

```json
{
  "successStories": {
    "featured": {
      "youtubeId": "dQw4w9WgXcQ",
      "description": "Main success story video"
    }
  }
}
```

**How to get YouTube ID:**
- From URL `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- The ID is: `dQw4w9WgXcQ`

### Method 2: Vimeo Videos
```json
{
  "methodology": {
    "featured": {
      "vimeoId": "123456789",
      "description": "Methodology explanation video"
    }
  }
}
```

**How to get Vimeo ID:**
- From URL `https://vimeo.com/123456789`
- The ID is: `123456789`

### Method 3: Custom Embed Code
```json
{
  "leadership": {
    "featured": {
      "embedCode": "<iframe src='...' frameborder='0' allowfullscreen></iframe>",
      "description": "Leadership team introduction"
    }
  }
}
```

### Video Thumbnails (Success Stories Section)
```json
{
  "successStories": {
    "gallery": [
      {
        "title": "Maria's Journey",
        "youtubeId": "VIDEO_ID_HERE",
        "thumbnail": "/assets/images/story-1-thumb.jpg",
        "description": "From detention to university graduate"
      }
    ]
  }
}
```

## 🖼️ Adding Images

### Gallery Images (Spain Centers)
1. Place images in `/assets/images/` folder
2. Update `/content/galleries.json`:

```json
{
  "spainCenters": {
    "images": [
      {
        "src": "/assets/images/your-image.jpg",
        "alt": "Description for accessibility",
        "title": "Image Title",
        "description": "Brief description shown on hover",
        "isLarge": false
      }
    ]
  }
}
```

### Team Member Photos
```json
{
  "team": {
    "members": [
      {
        "name": "Your Name",
        "role": "Your Role",
        "description": "Brief description",
        "photo": "/assets/images/team-yourname.jpg",
        "bio": "Longer biography text"
      }
    ]
  }
}
```

## 📝 Updating Text Content

### Hero Section
Edit `/content/hero.json`:
```json
{
  "title": "Your Main Title\nSecond Line",
  "subtitle": "Your subtitle",
  "stats": [
    {
      "number": "35",
      "label": "Years of Experience",
      "description": "Longer description"
    }
  ]
}
```

### Other Sections
Content is managed directly in `/index.html`. Look for:
- `<h2 class="section-title">` - Section titles
- `<p class="section-subtitle">` - Section subtitles
- Text within sections

## 🔗 Adding Links

Edit the links section in `/index.html` or create `/content/links.json`:

```html
<div class="link-category">
  <h3>Your Category</h3>
  <ul class="link-list">
    <li><a href="https://example.com" target="_blank" rel="noopener">Link Title</a></li>
  </ul>
</div>
```

## 📁 File Structure

```
content/
├── hero.json          # Hero section content
├── videos.json        # Video embeds and data
├── galleries.json     # Image galleries and team
└── structure.json     # Site structure config

assets/
├── images/           # All images
├── videos/          # Local video files
└── icons/           # Icons and logos
```

## 🎬 Video Embedding Examples

### Complete YouTube Example:
```json
{
  "successStories": {
    "title": "Real Success Stories",
    "subtitle": "Transformative journeys",
    "featured": {
      "youtubeId": "dQw4w9WgXcQ",
      "description": "Main success story compilation",
      "poster": "/assets/images/success-poster.jpg"
    },
    "gallery": [
      {
        "title": "John's Story",
        "youtubeId": "anotherVideoId",
        "thumbnail": "/assets/images/john-thumb.jpg",
        "description": "From troubled youth to community leader"
      }
    ]
  }
}
```

### Multiple Platform Support:
```json
{
  "methodology": {
    "featured": {
      "youtubeId": "mainVideoId",
      "vimeoId": "backupVideoId",
      "embedCode": "<iframe>...</iframe>",
      "description": "Our proven methodology explained"
    }
  }
}
```

## 🚀 Quick Start Steps

1. **Add a YouTube video:**
   - Copy YouTube video ID
   - Edit `/content/videos.json`
   - Add ID to appropriate section
   - Save and refresh page

2. **Add team photo:**
   - Upload image to `/assets/images/`
   - Edit `/content/galleries.json`
   - Add team member info
   - Save and refresh

3. **Update text:**
   - Edit `/index.html` for section text
   - Edit JSON files for data-driven content
   - Save and refresh

## 💡 Tips

- **Image sizes:** Recommended 1200x800px for gallery images
- **Video thumbnails:** 400x225px (16:9 ratio)
- **Team photos:** Square format, 400x400px minimum
- **File naming:** Use lowercase, hyphens instead of spaces
- **Alt text:** Always provide descriptive alt text for accessibility

## 🔧 Testing

After adding content:
1. Save all files
2. Refresh your browser (Cmd/Ctrl + R)
3. Check browser console for any errors
4. Test on mobile devices
5. Verify all links open correctly

Need help? Check the browser console (F12) for error messages or contact your developer.