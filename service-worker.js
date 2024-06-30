const FETCH_PRIORITY_URLS = ['/', '/index.html', '/style.css', '/App.js'];

self.addEventListener('install', (event) => {
  console.log("Установлен");

  event.waitUntil(
    caches.open('my-best-cache')
      .then((cache) => {
        cache.addAll([
          './',
          './index.html',
          './style.css',
          './App.js'
        ])
      })
  )
})

self.addEventListener('activate', (event) => {
  console.log("Активирован");
})


async function fetchPriorityThenCache(event) {
  let response;
  try {
    response = await fetch(event.request);
  } catch (error) {
    const cacheResponse = await caches.match(event.request);
    if (cacheResponse) {
      return cacheResponse;
    }
    return new Response('Нет соединения')
  }
  const cache = await caches.open('my-best-cache');
  cache.put(event.request, response.clone());
  return response;
}


async function cachePrioritThenFetch(event) {
  const cacheResponse = await caches.match(event.request);
  if (cacheResponse) {
    return cacheResponse;
  }
  let response;
  try {
    response = await fetch(event.request);
  } catch (error) {
    return;
  }
  const cache = await caches.open('my-best-cache');
  cache.put(event.request, response.clone());
  return response;
}


self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (FETCH_PRIORITY_URLS.includes(url.pathname)) {
    event.respondWith(fetchPriorityThenCache(event))
    return;
  }
  event.respondWith(cachePrioritThenFetch(event))
});