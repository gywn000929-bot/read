/* 한국 문학 서재 서비스 워커 — 앱 껍데기를 캐시해 오프라인에서도 읽게 한다.
   책 본문(books/*.json)은 읽을 때 받아 두었다가 다음부터 캐시에서 낸다. */
/* 캐시 이름을 올리면 activate 에서 예전 캐시를 통째로 지운다. */
const V = 'hanbook-v1';
/* index.html 은 미리 캐시하지 않는다 — 설치 시점 화면이 굳어 새 판이 기기에 닿지 못한다.
   페이지 이동은 네트워크 우선이고 성공한 응답을 그때 담으므로 오프라인도 그대로 된다. */
const SHELL = [
  './manifest.webmanifest',
  './books/manifest.json',
  '../icons/icon-192.png', '../icons/icon-512.png', '../icons/icon-180.png'
];

self.addEventListener('install', e => {
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
  if (url.origin !== location.origin) return;      // 글꼴은 그대로 통과

  /* 책 목록은 네트워크 우선 — 책을 더하면 이 파일이 바뀐다.
     캐시 우선으로 두면 기기에 옛 목록이 계속 남는다. */
  if (url.pathname.endsWith('/books/manifest.json')) {
    e.respondWith(
      fetch(req).then(r => {
        if (r && r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); }
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // 페이지 이동은 네트워크 우선 — 새 판이 바로 반영되도록
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // 나머지(책 본문·글꼴)는 캐시 우선 + 뒤에서 조용히 갱신
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => {
      if (r && r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
