# Got Greens Farm - Interactive Map

An interactive, mobile-first web map of Got Greens Farm using Leaflet with live GPS tracking, custom watercolor overlay, and a powerful admin system.

## Features

- 🗺️ **Live Interactive Map** - Leaflet-powered with OpenStreetMap tiles
- 📍 **GPS Tracking** - Real-time user location with pulsing marker
- 🎨 **Custom Watercolor Overlay** - Hand-drawn farm map overlay with adjustable opacity and position
- 📱 **Mobile-First Design** - Fluent UI components optimized for touch
- 🏷️ **POI Management** - 12 farm locations with descriptions and "Dig Deeper" content
- 🖼️ **In-App Content Viewer** - View POI details without leaving the map
- 🛠️ **Admin Mode** - Full POI editing, overlay positioning with arrow controls
- 💾 **Persistent Config** - All changes save to config.json via API
- 🎯 **Precise Controls** - Button-based overlay positioning (Shift for fine adjustment)
- 🔒 **Keyboard Shortcut** - Ctrl+Shift+A to toggle admin mode

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   This will open the map at `http://localhost:3000`

### Development vs Production

**Development Mode** (localhost):
- Admin changes save directly to `config.json`
- No annoying download popups!
- File system integration via Vite

**Production Mode** (GitHub Pages):
- Admin changes save to browser localStorage
- Use Export/Import to persist changes
- Commit exported JSON to your repository

## Admin Mode

Activate with **Ctrl+Shift+A** or toggle button in admin panel:

### POI Management
- **Drag Markers**: Click and drag POI markers to reposition
- **Edit POI**: Click marker then edit in form (ID, label, description, URL, coordinates)
- **Add Location**: Create new POIs with "Add Location" button
- **Delete**: Remove POIs via edit form

### Overlay Controls
- **Edit Overlay Position**: Click to activate arrow button controls
- **Arrow Buttons**: ↑ ↓ ← → to move overlay (each click = ~2 meters)
- **Fine Adjustment**: Shift+Click arrows for precise movements (~0.2 meters)
- **Keyboard**: Arrow keys work when position controls are active
- **Opacity Slider**: Adjust overlay transparency (0-100%)
- **Scale Slider**: Resize overlay while maintaining aspect ratio (80-500%)
- **Toggle Overlay**: Show/hide the watercolor map overlay

### Settings
- **Show Labels**: Toggle permanent POI labels visibility
- **Show Admin Button**: Display admin toggle button for all users

All changes auto-save to `config.json` via Vite dev server API.

## Tech Stack

- **Leaflet 1.9.4** - Interactive mapping library
- **Fluent UI Web Components 2.6.1** - Microsoft design system
- **Vite 8.0.10** - Build tool and dev server
- **Vanilla JavaScript** - ES6 modules, no framework bloat
- **OpenStreetMap** - Free, collaborative map tiles

## Project Structure

```
site_map/
├── config.json                    # POI locations, settings, overlay config
├── index.html                     # Main app structure
├── script.js                      # Map logic, admin controls, POI rendering
├── styles.css                     # Fluent UI theme, Got Greens colors
├── map-overlay/                   # Watercolor overlay image
│   └── gg_vertical_site_map_handdrawn.png
├── vite.config.js                 # Dev server + /api/save-config endpoint
└── package.json                   # Dependencies
```

## Building for Production

```bash
npm run build
```

This creates a `dist/` folder ready for deployment to GitHub Pages.

## Deployment to GitHub Pages

### Quick Deploy

```bash
# Build production version
npm run build

# Commit and push
git add .
git commit -m "Update farm map"
git push origin main

# Deploy to gh-pages branch
npm run deploy
```

### Initial Setup

1. **Install gh-pages** (if not already):
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script** to package.json:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Save

4. **Set base path** in vite.config.js:
   ```js
   export default {
     base: '/Interactive-Farm-Map/'  // Your repo name
   }
   ```

Your map will be live at: `https://yourusername.github.io/Interactive-Farm-Map/`

## Configuration

### config.json Structure

```json
{
  "settings": {
    "showLabelsDefault": true,
    "showAdminButton": true,
    "overlayVisible": true,
    "overlayOpacity": 0.7,
    "overlayCenter": [51.53347, -2.525802],
    "overlayWidth": 0.002987,
    "overlayRotation": 0
  },
  "pois": [
    {
      "id": "market-garden",
      "label": "Market Garden",
      "description": "600 square meter no-dig market garden...",
      "url": "https://www.gotgreens.farm/point-of-interest/market-garden",
      "lat": 51.5333,
      "lng": -2.5252
    }
  ]
}
```

### Customizing the Overlay

1. Replace `map-overlay/gg_vertical_site_map_handdrawn.png` with your image
2. In admin mode, use "Edit Overlay Position" controls
3. Adjust scale (80-500%) and opacity (0-100%) sliders
4. Fine-tune position with arrow buttons (Shift for precision)

### Changing POI URLs

Edit the `BASE_URL` constant in `script.js`:
```javascript
const BASE_URL = 'https://www.gotgreens.farm/point-of-interest/';
```

### Styling

Modify colors, fonts, and animations in `styles.css`.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2026 Got Greens Farm. All rights reserved.
