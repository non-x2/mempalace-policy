/* FreeWiFi Finder - Service Worker
 * アプリのシェル（HTML/地図ライブラリ）をキャッシュしてオフライン起動と高速化を実現。
 * 検索系API（Overpass / Nominatim / 地図タイル）は常にネットワークを使う。 */
var CACHE = "freewifi-v1";
var LOCAL_ASSETS = ["wifi.html", "manifest.webmanifest", "icon.svg"];
var CDN_ASSETS = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // ローカル資産は必須、CDN は失敗しても無視（オフライン時の前回キャッシュに任せる）
      return c.addAll(LOCAL_ASSETS).then(function () {
        return Promise.all(CDN_ASSETS.map(function (u) {
          return c.add(u).catch(function () {});
        }));
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var host = "";
  try { host = new URL(e.request.url).host; } catch (err) { return; }

  // 検索系・地図タイルはキャッシュせず常にネットワーク
  if (/overpass|nominatim|tile\.openstreetmap\.org/.test(host)) return;

  // それ以外: キャッシュ優先、無ければネットワーク → 取得分を追加キャッシュ
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (resp) {
        if (resp && resp.ok) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return resp;
      }).catch(function () {
        return caches.match("wifi.html");
      });
    })
  );
});
