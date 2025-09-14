PakRide Customer App - Public Assets
This folder contains all the static assets and configuration files for the PakRide Customer App.

📁 Files Overview
Core Files
index.html - Main HTML template with PWA features, loading screen, and meta tags
manifest.json - Progressive Web App manifest for installability
sw.js - Service Worker for offline functionality and caching
offline.html - Offline fallback page when no internet connection
SEO & Metadata
robots.txt - Search engine crawler instructions
sitemap.xml - XML sitemap for search engine indexing
browserconfig.xml - Microsoft browser tile configuration
Server Configuration
.htaccess - Apache server configuration (security, caching, redirects)
🖼️ Required Image Assets
The following image files need to be added to this folder:

Icons & Logos
favicon.ico                 # 16x16, 32x32, 48x48 favicon
logo192.png                # 192x192 app icon
logo512.png                # 512x512 app icon
apple-touch-icon.png       # 180x180 iOS icon
maskable-icon-192.png      # 192x192 maskable icon
maskable-icon-512.png      # 512x512 maskable icon
Microsoft Tiles
mstile-70x70.png          # 70x70 small tile
mstile-150x150.png        # 150x150 medium tile
mstile-310x150.png        # 310x150 wide tile
mstile-310x310.png        # 310x310 large tile
Social Media Images
og-image.png              # 1200x630 Open Graph image
twitter-image.png         # 1200x600 Twitter card image
App Screenshots
screenshots/
├── home-mobile.png       # 320x640 mobile screenshot
├── booking-mobile.png    # 320x640 mobile screenshot
└── home-desktop.png      # 1280x720 desktop screenshot
Shortcut Icons
icons/
├── shortcut-ride.png     # 96x96 ride shortcut icon
├── shortcut-track.png    # 96x96 track shortcut icon
├── shortcut-wallet.png   # 96x96 wallet shortcut icon
├── checkmark.png         # 32x32 notification action icon
└── xmark.png            # 32x32 notification close icon
Additional Icons
badge-72x72.png           # 72x72 notification badge
favicon-32x32.png         # 32x32 favicon variant
favicon-16x16.png         # 16x16 favicon variant
🎨 Icon Design Guidelines
Color Scheme
Primary: 
#16a34a (Pakistan Green)
Secondary: 
#ffffff (White)
Background: Use gradients from green to darker green
Design Requirements
Favicon: Simple "P" or car icon in green
App Icons: PakRide logo with green background
Maskable Icons: Icon should be centered with safe area padding
Tiles: High contrast, readable text on green background
Sample Icon Creation
css
/* Base icon style */
background: linear-gradient(135deg, #16a34a, #059669);
color: white;
border-radius: 15px; /* For app icons */
🔧 Configuration Details
PWA Features
Installable: App can be installed on home screen
Offline Support: Service worker caches essential resources
Background Sync: Syncs data when connection restored
Push Notifications: Ride updates and promotional messages
Security Headers
Content Security Policy (CSP)
XSS Protection
Clickjacking Protection
HSTS (HTTPS enforcement)
Performance Optimizations
Compression: Gzip/Deflate for all text assets
Caching: Long-term caching for static assets
Preloading: DNS prefetch and preconnect for external resources
📱 Mobile Optimization
Viewport Configuration
html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
iOS Safari
Status bar styling
Home screen icon
Splash screen configuration
Android Chrome
Theme color for status bar
Maskable icons for adaptive icons
Install prompt handling
🚀 Deployment Notes
Production Checklist
✅ Add all required image assets
✅ Update manifest.json with production URLs
✅ Configure HTTPS redirects in .htaccess
✅ Set up proper caching headers
✅ Test PWA installation
✅ Verify offline functionality
✅ Test on multiple devices and browsers
CDN Configuration
For production, consider moving static assets to a CDN:

https://cdn.pakride.com/customer/
├── icons/
├── images/
└── screenshots/
Analytics Integration
Add tracking pixels or analytics scripts in index.html:

html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>

<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s) {/* Facebook Pixel Code */}
</script>
🔍 Testing
PWA Testing
Chrome DevTools > Application > Manifest
Lighthouse PWA audit
Test offline functionality
Verify service worker registration
Cross-Browser Testing
Safari (iOS/macOS)
Chrome (Android/Desktop)
Firefox (Android/Desktop)
Edge (Windows)
Performance Testing
PageSpeed Insights
GTmetrix
WebPageTest
Core Web Vitals
📋 Maintenance
Regular Updates
Update service worker version for new releases
Refresh manifest.json if app details change
Update sitemap.xml for new pages
Monitor and update security headers
Monitoring
Track PWA installation rates
Monitor offline usage patterns
Analyze Core Web Vitals
Check for broken external links
Note: This folder is served statically and should not contain any sensitive information or API keys.

