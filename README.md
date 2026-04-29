# Got Greens Farm - Interactive Map

An interactive, mobile-responsive map of Got Greens Farm featuring clickable points of interest with a powerful admin system.

## Features

- 🗺️ Interactive map with customizable points of interest
- 📱 Mobile-first responsive design
- 🎨 Smooth animations and hover effects
- ♿ Keyboard accessible
- 🔗 Links to individual POI pages
- 🛠️ **Admin Mode** - Drag & drop POI positioning, add/edit/delete locations
- 🖼️ **Multiple Maps** - Upload and switch between different map views
- 💾 **Data Management** - Export/import JSON configurations
- 📝 **Rich Info** - Each POI has description and "Dig Deeper" links

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

1. Click "Admin Mode" button in the header
2. **Drag Markers**: Click and drag any POI to reposition
3. **Double-Click**: Edit POI details (label, description, URL)
4. **Add Location**: Create new POIs
5. **Manage Maps**: Upload new map images and set positions
6. **Show Labels Toggle**: Control default label visibility
7. **Export Data**: Download complete configuration
8. **Import Data**: Load saved configurations

## Project Structure

```
site_map/
├── config.json          # POI and map configuration
├── index.html           # Main HTML file
├── script.js            # Application logic
├── styles.css           # Styling
├── map-images/          # Uploaded map images
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies
```

## Building for Production

```bash
npm run build
```

This creates a `dist/` folder ready for deployment.

## Deployment to GitHub Pages

### Option 1: Automated GitHub Actions

1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add farm map with admin"
   git push
   ```

3. Enable GitHub Pages in Settings → Pages → Source: `gh-pages` branch

### Option 2: Manual Deploy

```bash
npm run build
# Upload contents of dist/ folder to your hosting
```

## Data Format

See [config.json](config.json) for the complete data structure.

**POIs** (global across maps):
```json
{
  "id": "polytunnel",
  "label": "Polytunnel", 
  "description": "Short description...",
  "url": "https://..."
}
```

**Maps** (each with specific POI positions):
```json
{
  "id": "default",
  "filename": "farm-map.jpg",
  "positions": {
    "polytunnel": { "top": "8%", "left": "52%" }
  }
}
```

## Customization

### Adjusting POI Positions

Edit the `style` attribute on each `.poi-marker` div in `index.html`:
```html
<div class="poi-marker" data-poi="polytunnel" style="top: 8%; left: 52%;">
```

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
