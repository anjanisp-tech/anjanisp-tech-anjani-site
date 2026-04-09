# SEO Pipeline Specification

This document defines the folder structure and file format for the automated SEO execution pipeline.

## 1. Google Drive Folder Structure

Create a root folder named `SEO_PIPELINE` and share it with your Service Account email. Inside, create the following subfolders:

- `01_PENDING`: Drop new instruction files here.
- `02_PROCESSED`: Successfully executed files will be moved here.
- `03_FAILED`: Files that failed validation or execution will be moved here.

**Folder ID Requirement**: You must provide the Folder ID of the `SEO_PIPELINE` root folder in the Admin panel or via the `GOOGLE_DRIVE_SEO_FOLDER_ID` environment variable.

## 2. File Naming Convention

Files should be in `.json` format.
**Format**: `YYYY-MM-DD_ActionName.json`
**Example**: `2026-04-09_HomeMetaUpdate.json`

## 3. Supported Actions & JSON Formats

### UPDATE_METADATA
Updates the page title, description, and keywords.
```json
{
  "action": "UPDATE_METADATA",
  "target": "src/pages/Home.tsx",
  "payload": {
    "title": "Anjani Pandey | Operating Spine Specialist",
    "description": "Helping founders scale by installing structural operating systems.",
    "keywords": "Operating Spine, Metmov, Scaling, Founder"
  }
}
```

### UPDATE_OG_TAGS
Updates Open Graph and Twitter card metadata.
```json
{
  "action": "UPDATE_OG_TAGS",
  "target": "src/pages/Home.tsx",
  "payload": {
    "og:title": "Scaling Architect | Anjani Pandey",
    "og:description": "The Operating Spine for $1M-$10M ARR businesses.",
    "og:image": "https://anjanipandey.com/og-image.jpg",
    "og:url": "https://anjanipandey.com",
    "twitter:card": "summary_large_image"
  }
}
```

### UPDATE_HEADING_STRUCTURE
Changes the text or tag of a heading.
```json
{
  "action": "UPDATE_HEADING_STRUCTURE",
  "target": "src/pages/Home.tsx",
  "payload": {
    "old_text": "Welcome to my site",
    "new_text": "The Scaling Architect",
    "tag": "h1"
  }
}
```

### ADD_INTERNAL_LINK
Injects an internal link into a paragraph or after a specific text block.
```json
{
  "action": "ADD_INTERNAL_LINK",
  "target": "src/pages/Home.tsx",
  "payload": {
    "anchor_text": "view my services",
    "url": "/services",
    "after_text": "To learn more about how I help founders,"
  }
}
```

### ADD_PAGE
Creates a completely new page file and registers it in the router.
```json
{
  "action": "ADD_PAGE",
  "target": "src/pages/CaseStudies.tsx",
  "payload": {
    "route": "/case-studies",
    "title": "Case Studies | Metmov",
    "content": "<h1>Case Studies</h1><p>Detailed results of Operating Spine installations.</p>"
  }
}
```

### UPDATE_IMAGE_ALT
Updates the alt attribute of an image identified by its source.
```json
{
  "action": "UPDATE_IMAGE_ALT",
  "target": "src/pages/Home.tsx",
  "payload": {
    "image_src": "/assets/profile.jpg",
    "new_alt": "Anjani Pandey - The Scaling Architect"
  }
}
```

### ADD_SCHEMA
Adds JSON-LD structured data to a page.
```json
{
  "action": "ADD_SCHEMA",
  "target": "src/pages/Home.tsx",
  "payload": {
    "type": "FAQPage",
    "data": {
      "mainEntity": [{
        "@type": "Question",
        "name": "What is an Operating Spine?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The structural architecture that replaces founder heroics with systems."
        }
      }]
    }
  }
}
```

### UPDATE_SITEMAP
Adds or removes entries from the sitemap.
```json
{
  "action": "UPDATE_SITEMAP",
  "payload": {
    "add": ["/case-studies"],
    "remove": ["/old-service-page"]
  }
}
```

### UPDATE_ROBOTS
Updates the content of the robots.txt file.
```json
{
  "action": "UPDATE_ROBOTS",
  "payload": {
    "content": "User-agent: *\nAllow: /\nSitemap: https://anjanipandey.com/sitemap.xml"
  }
}
```

### INJECT_CONTENT
Adds a new content block at a specific position.
```json
{
  "action": "INJECT_CONTENT",
  "target": "src/pages/Home.tsx",
  "payload": {
    "content": "<section>New Section Content</section>",
    "position": "after",
    "anchor": "hero-section"
  }
}
```

### ADD_CANONICAL
Sets or updates the canonical URL for a page.
```json
{
  "action": "ADD_CANONICAL",
  "target": "src/pages/Home.tsx",
  "payload": {
    "url": "https://anjanipandey.com/"
  }
}
```

### ADD_HREFLANG
Adds hreflang tags for international targeting.
```json
{
  "action": "ADD_HREFLANG",
  "target": "src/pages/Home.tsx",
  "payload": {
    "lang": "en-gb",
    "url": "https://anjanipandey.com/uk/"
  }
}
```

### UPDATE_PAGE_SPEED
Applies performance optimizations like lazy loading.
```json
{
  "action": "UPDATE_PAGE_SPEED",
  "target": "src/pages/Home.tsx",
  "payload": {
    "lazy_load_images": true,
    "defer_scripts": true,
    "preload_assets": ["/fonts/inter.woff2"]
  }
}
```
