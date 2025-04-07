# OneSignal Proxy for CloudFlare Workers

This package proxies OneSignal resources through a custom domain (e.g., `push.example.com`). Inspired by [verificatorrus/onesignal-proxy](https://github.com/verificatorrus/onesignal-proxy). Includes instructions for WordPress integration.

## Prerequisites

- Node.js and npm installed
- CloudFlare account
- Access to your OneSignal dashboard and WordPress site (example.com)

## Installation

1. Clone or download this repository:

   ```bash
   git clone https://github.com/your-username/onesignal-proxy.git
   cd onesignal-proxy
   ```

2. Install Wrangler CLI (`npm install -g wrangler`)

3. Configure `wrangler.toml`:
   - Update `[vars]` with your specific domains and paths (e.g., `PROXY_DOMAIN`, `ONESIGNAL_CDN`, etc.).
   - Set the `route` under `[env.production]` to match your proxy subdomain (e.g., `push.example.com/*`).

4. Log in to Wrangler:

   ```bash
   wrangler login
   ```

5. Deploy the Worker:

   ```bash
   wrangler publish
   ```

## Configuration Steps

### On OneSignal Dashboard

- Rename service worker files and paths:
  - Set path to `/custom-push-sdk/`
  - Set main and updater service worker filenames to `pushWorker.js`
  - Set registration scope to `/custom-push-sdk/`
- Follow the [OneSignal Service Worker Migration Guide](https://documentation.onesignal.com/docs/onesignal-service-worker-faq#onesignal-service-worker-migration-guide) to avoid breaking existing subscriptions.

### On WordPress Site (example.com)

- Add this filter to your theme's `functions.php` (or use a plugin such as [WordPress Code Manager](https://wordpress.org/plugins/insert-headers-and-footers/)) to rewrite the SDK URL:

  ```php
  function custom_push_script($tag, $handle, $src) {
      if (strpos($src, 'onesignal.com') !== false) {
          return str_replace('https://cdn.onesignal.com', 'https://push.example.com', $tag);
      }
      return $tag;
  }
  add_filter('script_loader_tag', 'custom_push_script', 10, 3);
  ```

- Rename and update the local service worker file (`/wp-content/plugins/onesignal-free-web-push-notifications/sdk_files/OneSignalSDKWorker.js`) to `/custom-push-sdk/pushWorker.js` with content:

  ```javascript
  importScripts("https://push.example.com/sdks/web/v16/pushSW.js");
  ```

## Testing

- Enable adblockers in your browser and verify that scripts, service workers, and notifications load without being blocked.
- Check network requests to ensure all OneSignal domains are replaced with your proxy domain.

## Notes

- Ensure SSL is configured for your proxy domain (`push.example.com`).
- Monitor for performance impacts and adjust caching as needed.
- If blockers still detect "OneSignal," consider further obfuscation of JavaScript content.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
