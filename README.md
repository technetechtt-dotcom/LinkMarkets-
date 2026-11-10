# FleetMarket SA — Standalone Progressive Web Application (PWA)

FleetMarket SA is a **separate app from RiderLink SA**. It is an installable, mobile-responsive marketplace prototype for advertising delivery motorcycles and e-hailing cars in South Africa.

## Run and install locally

1. Extract this ZIP, then open the `fleetmarket-sa` folder in Cursor / VS Code.
2. Start a local web server from inside the folder: `python -m http.server 8000` (or VS Code Live Server).
3. Visit `http://localhost:8000` in Chrome or Edge.
4. After the site loads, use the **Install app** prompt (when offered), or your browser menu's **Install app** option. On iPhone Safari, use **Share → Add to Home Screen**.
5. For real-device installation over the internet, deploy the folder to an **HTTPS** host. A file opened with `file://` cannot register its service worker.

## PWA features
- `manifest.webmanifest` with app name, standalone window, colours and icons.
- 192px, 512px maskable icons plus an Apple touch icon.
- `service-worker.js` caches the local app shell for offline reopening after the first successful visit.
- Network-first navigation so updated app versions can be fetched when online.
- Offline/online status indicator and browser-supported install prompt.
- Responsive layout and local browser storage for prototype listings and enquiries.

## Marketplace prototype features
- Browse demo vehicle listings; search and filter by type, city and intended platform.
- Save favourites and create, edit, pause or delete local vehicle listings.
- View listing details and save local demo enquiries.
- Sample listings, names and owners are **fictional**.

## Limits — important
This is **not yet a live multi-user marketplace**. Listings, favourites and enquiries are saved only in the current browser's localStorage, not shared across devices. They can disappear if browser data is cleared or the app is uninstalled. The PWA installation **does not add** a cloud database, accounts or real message delivery. External photos/fonts require network access unless already cached by the browser. Service-worker shell caching does not guarantee external photo availability offline. The app does not support background sync or push notifications yet.

## Production requirements
- Secure owner and driver registration, roles and listing ownership controls.
- Shared backend database, media uploads, moderation, abuse reports and fraud prevention.
- Server-side listing search, owner messaging and notifications.
- POPIA-compliant policies, consent and data handling, e-hailing eligibility verification.
- Deploy on HTTPS, test installations on Android/iOS and test offline upgrades.

No RiderLink SA files or data are included or modified.
