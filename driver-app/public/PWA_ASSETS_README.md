# PWA Assets for RideDriver App

This folder contains all the necessary assets for the Progressive Web App (PWA) functionality of the RideDriver application.

## Required Image Assets

You'll need to create the following image files to complete the PWA setup:

### App Icons
- `favicon.ico` (16x16, 32x32, 48x48, 64x64 pixels)
- `logo192.png` (192x192 pixels) - Standard app icon
- `logo512.png` (512x512 pixels) - Large app icon
- `apple-touch-icon.png` (180x180 pixels) - iOS home screen icon

### Maskable Icons (for Android adaptive icons)
- `maskable-icon-192.png` (192x192 pixels)
- `maskable-icon-512.png` (512x512 pixels)

### Microsoft Tile Icons
- `mstile-70x70.png` (70x70 pixels)
- `mstile-150x150.png` (150x150 pixels)
- `mstile-310x150.png` (310x150 pixels)
- `mstile-310x310.png` (310x310 pixels)

### Notification Icons
- `badge-72.png` (72x72 pixels) - Notification badge
- `shortcuts/online-96.png` (96x96 pixels) - Go online shortcut
- `shortcuts/earnings-96.png` (96x96 pixels) - Earnings shortcut
- `shortcuts/profile-96.png` (96x96 pixels) - Profile shortcut
- `icons/accept.png` (32x32 pixels) - Accept ride action
- `icons/decline.png` (32x32 pixels) - Decline ride action

### Splash Screens (Optional)
For better iOS experience, you can add splash screens:
- `splash-640x1136.png` (iPhone SE)
- `splash-750x1334.png` (iPhone 8)
- `splash-828x1792.png` (iPhone XR)
- `splash-1125x2436.png` (iPhone X)
- `splash-1242x2208.png` (iPhone 8 Plus)
- `splash-1242x2688.png` (iPhone XS Max)
- `splash-1536x2048.png` (iPad)
- `splash-1668x2224.png` (iPad Pro 10.5")
- `splash-1668x2388.png` (iPad Pro 11")
- `splash-2048x2732.png` (iPad Pro 12.9")

## Design Guidelines

### Color Scheme
- Primary Blue: `#2563eb`
- Dark Blue: `#1e40af`
- Light Blue: `#dbeafe`
- Background: `#ffffff`

### Icon Design
- Use the car/driver theme
- Maintain consistency with the app's branding
- Ensure icons are clearly visible on various backgrounds
- Follow platform-specific guidelines (iOS, Android, Windows)

### Maskable Icons
- Safe area: 80% of the icon (center 80%)
- Full bleed area: 100% of the icon
- Minimum contrast ratio: 3:1

## Tools for Icon Generation

1. **PWA Builder**: https://www.pwabuilder.com/imageGenerator
2. **Favicon.io**: https://favicon.io/
3. **App Icon Generator**: https://appicon.co/
4. **Maskable.app**: https://maskable.app/

## Implementation Notes

1. All icons should be optimized for web (compressed)
2. Use PNG format for most icons (except favicon.ico)
3. Ensure icons work well in dark and light themes
4. Test icons on various devices and browsers
5. Consider using SVG for favicon for better scalability

## Validation

After adding all assets, validate your PWA using:
- Chrome DevTools > Application > Manifest
- Lighthouse PWA audit
- https://realfavicongenerator.net/
- https://web.dev/measure/

## File Structure

```
public/
├── favicon.ico
├── favicon.svg
├── logo192.png
├── logo512.png
├── apple-touch-icon.png
├── maskable-icon-192.png
├── maskable-icon-512.png
├── badge-72.png
├── mstile-70x70.png
├── mstile-150x150.png
├── mstile-310x150.png
├── mstile-310x310.png
├── shortcuts/
│   ├── online-96.png
│   ├── earnings-96.png
│   └── profile-96.png
├── icons/
│   ├── accept.png
│   └── decline.png
└── splash/
    ├── splash-640x1136.png
    ├── splash-750x1334.png
    └── ... (other splash screens)
```

Remember to update the manifest.json file if you change any file names or add new icons!