
// Service Worker has been removed/disabled to prevent caching issues.
// We are now using vite-plugin-pwa which generates sw.js automatically.
// If you see this file in the repo, it might be a remnant.
// To unregister existing SW:
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.clients.matchAll({ type: 'window' }).then(windowClients => {
        windowClients.forEach(windowClient => {
            windowClient.navigate(windowClient.url);
        });
    });
});
