const PROXY_DOMAIN = PROXY_DOMAIN;  // From wrangler.toml
const MAIN_DOMAIN = MAIN_DOMAIN;
const ONESIGNAL_CDN = ONESIGNAL_CDN;
const ONESIGNAL_API = ONESIGNAL_API;
const ONESIGNAL_IMG = ONESIGNAL_IMG;
const SDK_PATH_PREFIX = SDK_PATH_PREFIX;
const LOCAL_SW_PATH = LOCAL_SW_PATH;
const LOCAL_SW_FILENAME = LOCAL_SW_FILENAME;
const SDK_FILENAME = SDK_FILENAME;
const SW_FILENAME = SW_FILENAME;

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  let originalUrl;
  if (path.startsWith(SDK_PATH_PREFIX)) {
    // Proxy SDK files (e.g., pushSDK.js, pushSW.js)
    originalUrl = `https://${ONESIGNAL_CDN}${path}${url.search}`;
  } else if (path.startsWith(LOCAL_SW_PATH) && path.endsWith(LOCAL_SW_FILENAME)) {
    // Serve local service worker (modified to point to proxy)
    return new Response(`importScripts("https://${PROXY_DOMAIN}${SDK_PATH_PREFIX}${SW_FILENAME}");`, {
      headers: { 'Content-Type': 'application/javascript' },
    });
  } else if (path.startsWith('/images/') || path.includes(ONESIGNAL_IMG)) {
    // Proxy images
    originalUrl = `https://${ONESIGNAL_IMG}${path.replace('/images/', '/')}${url.search}`;
  } else {
    // Proxy API calls
    originalUrl = `https://${ONESIGNAL_API}${path}${url.search}`;
  }

  const response = await fetch(originalUrl);

  if (response.headers.get('Content-Type').includes('javascript')) {
    const text = await response.text();
    const modifiedText = text
      .replace(new RegExp(`https?:\/\/(${ONESIGNAL_CDN})`, 'g'), `https://${PROXY_DOMAIN}`)
      .replace(new RegExp(`https?:\/\/(${ONESIGNAL_API})`, 'g'), `https://${PROXY_DOMAIN}`)
      .replace(new RegExp(`https?:\/\/(${ONESIGNAL_IMG})`, 'g'), `https://${PROXY_DOMAIN}`)
      .replace(/OneSignalSDK/g, 'PushSDK') // Rename identifiers
      .replace(/OneSignal/g, 'PushService'); // Rename identifiers
    return new Response(modifiedText, { headers: { 'Content-Type': 'application/javascript' } });
  } else if (response.headers.get('Content-Type').includes('image')) {
    return response;
  } else {
    return response;
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});