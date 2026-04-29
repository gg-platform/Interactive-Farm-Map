# Got Greens Farm Interactive Map

A modern, mobile-first interactive map for Got Greens Farm featuring live user location tracking and in-app content viewing.

## Features

- **Live Map with Leaflet**: Real-time OpenStreetMap with user location tracking
- **Fluent UI Design**: Modern Microsoft Fluent Design System styling
- **Mobile-First**: Optimized for mobile devices with touch-friendly controls
- **In-App Content**: View POI details without leaving the map
- **Admin Mode**: Local configuration tool for positioning markers

## Development

### Running Locally

```bash
npm install
npm run dev
```

The app will open at `http://localhost:3000`

### Admin Mode (Local Only)

Admin mode is disabled by default for production. To enable it locally:

1. **Temporary Enable**: Press `Ctrl+Shift+A` to toggle admin mode
2. **Permanent Enable**: Edit `config.json` and set `"showAdminButton": true`

In admin mode you can:
- Drag markers to reposition them
- Click markers to edit details
- Add new locations
- Changes automatically save to `config.json`

### Configuration

All map data is stored in `config.json`:

```json
{
  "settings": {
    "showLabelsDefault": false,
    "showAdminButton": false
  },
  "pois": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "description": "Short description",
      "url": "https://www.gotgreens.farm/point-of-interest/...",
      "lat": 51.5333,
      "lng": -2.5289
    }
  ]
}
```

### Building for Production

```bash
npm run build
```

This creates a `dist/` folder ready for deployment.

## Location

**Got Greens Farm**  
Old Gloucester Rd, Winterbourne, Bristol BS36 1RZ  
Coordinates: 51.5333009704, -2.5289344788

## Tech Stack

- **Leaflet**: Interactive mapping
- **Fluent UI Web Components**: Modern UI components
- **Vite**: Fast development and building
- **Vanilla JS**: No framework overhead

## License

© Got Greens Community Interest Company 2022 - 2026
