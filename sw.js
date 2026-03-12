const CACHE_NAME = '3d-viewer-cache-v1';

// 오프라인에서 구동되기 위해 캐싱할 필수 파일 목록
const urlsToCache = [
  './',
  './index.html',
  './js/model-viewer.min.js', // 로컬로 저장한 라이브러리
  './model.glb', // 3D 모델 파일
  './hdr/studio.hdr', // 조명 환경 맵 파일
  // 만약 텍스처 이미지나 다른 CSS 파일이 있다면 이곳에 추가하세요.
];

// 1. 설치(Install): 파일들을 캐시에 저장합니다.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching large 3D assets');
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// 2. 활성화(Activate): 구버전 캐시를 삭제하고 용량을 확보합니다.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// 3. 패치(Fetch): 네트워크 연결이 없으면 캐시된 파일을 반환합니다. (Cache First 전략)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 파일이 있으면 캐시에서 바로 반환 (오프라인, 초고속 로딩)
      if (response) {
        return response;
      }
      // 캐시에 없으면 네트워크를 통해 가져옴
      return fetch(event.request).catch(() => {
        console.error('Offline and resource not found in cache:', event.request.url);
      });
    }),
  );
});
