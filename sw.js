/* Book Study 서비스 워커 — 앱 껍데기를 캐시해 오프라인에서도 읽을 수 있게 한다.
   책 본문(books/*.json)과 내가 넣은 책(IndexedDB)은 여기서 다루지 않는다. */
const V = 'bookstudy-v2';
/* index.html 은 일부러 미리 캐시하지 않는다.
   설치 시점 화면이 그대로 굳어버려서 새 기능이 배포돼도 안 보이는 일이 생긴다.
   페이지 이동은 네트워크 우선이고 성공한 응답을 그때 캐시하므로 오프라인도 그대로 동작한다. */
const SHELL = [
  './manifest.webmanifest',
  './vendor/pdfjs/pdf.min.js', './vendor/pdfjs/pdf.worker.min.js',
  './books/manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'
];

self.addEventListener('install', e => {
  // 일부 파일이 없어도 설치가 실패하지 않도록 개별로 담는다
  e.waitUntil(caches.open(V)
    .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== location.origin) return;   // 사전·번역 API 는 그대로 통과

  // 페이지 이동은 네트워크 우선 — 새 버전이 바로 반영되도록
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // 나머지는 캐시 우선 + 뒤에서 조용히 갱신
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => {
      if (r && r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
