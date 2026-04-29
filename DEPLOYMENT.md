# Deployment Instructions

The production build is ready in the `dist/` folder.

## 📦 What's Built

- `dist/index.html` - Main HTML file
- `dist/assets/` - Bundled CSS and JavaScript
- `dist/config.json` - POI configuration

## 🚀 Deployment Options

### Option 1: Static Web Hosting (Recommended)

Upload the entire `dist/` folder to any static web host:

**Services:**
- **Netlify**: Drag & drop the `dist` folder at netlify.com/drop
- **Vercel**: Run `vercel --prod` in the `dist` folder
- **GitHub Pages**: Push to a `gh-pages` branch
- **Cloudflare Pages**: Connect your repo or upload folder
- **AWS S3 + CloudFront**: Upload to S3 bucket with static website hosting

### Option 2: Traditional Web Server

Upload contents of `dist/` to your web server root (e.g., `public_html/`):

```bash
# Via FTP/SFTP - upload all files from dist/
# Via SSH
scp -r dist/* user@yourserver.com:/path/to/webroot/
```

### Option 3: Got Greens Website Integration

If integrating into the existing gotgreens.farm site:

1. Upload `dist/` contents to a subdirectory like `/map/`
2. Link from your main site: `https://www.gotgreens.farm/map/`
3. Or embed via iframe: `<iframe src="/map/"></iframe>`

## ⚙️ Configuration

The map configuration is in `dist/config.json`. To update POI locations after deployment:

1. Enable admin mode locally: Press `Ctrl+Shift+A`
2. Drag pins to correct positions
3. Changes save to local `config.json`
4. Copy updated `config.json` to `dist/config.json`
5. Re-upload just the `config.json` file

## 📱 Features Enabled

✅ Live location tracking (requires HTTPS for GPS)  
✅ Mobile-optimized interface  
✅ In-app POI content viewing  
✅ Fluent UI design  
✅ All 12 farm POIs configured  

## 🔒 HTTPS Required

For GPS location tracking to work, the site must be served over HTTPS. Most modern hosting providers (Netlify, Vercel, etc.) provide this automatically.

## 🧪 Test Deployment

Preview the build locally:
```bash
npm run preview
```

This runs a local server at http://localhost:4173 to test the production build.

---

**Ready to deploy!** The `dist/` folder contains everything needed.
