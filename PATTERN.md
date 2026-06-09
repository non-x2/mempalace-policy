# 🎯 個人専用Webアプリ構築パターン（型）

> 「自分だけが使えるWebアプリ」を最小コストで作る再利用可能な型。
> 2026-06-09 FreeWiFi Finder で実証。費用 $0/月、PWAでスマホアプリ感、外部認証付き。

---

## 🏛️ アーキテクチャ

```
[GitHub repo]
   ↓ git push (自動デプロイ)
[Cloudflare Workers]
   ↓ HTTPS
[Cloudflare Access]
   ↓ メール認証 (One-time PIN)
[本人のブラウザ]
```

- **フロント**: 静的HTML + JS、依存はCDN（Leaflet等）。バックエンド不要。
- **PWA**: `manifest.webmanifest` + `sw.js` でホーム画面追加対応。
- **ホスティング**: Cloudflare Workers（静的アセット配信モード）
- **認証**: Cloudflare Access（Self-hosted application、Zero Trust Free）
- **コスト**: 全部 $0/月（無料枠50ユーザーまで）

## 📂 ファイル構成テンプレ

| ファイル | 役割 | 必須 |
|---|---|---|
| `index.html` / `app.html` | アプリ本体（単一HTML推奨） | ✅ |
| `manifest.webmanifest` | PWAマニフェスト | ⭐推奨 |
| `sw.js` | Service Worker（オフライン枠＋キャッシュ） | ⭐推奨 |
| `icon.svg` | アプリアイコン（SVG1枚で全サイズ対応） | ⭐推奨 |
| `wrangler.toml` | Cloudflare Workers 設定 | ✅ |
| `README.md` / `HANDOFF.md` | ドキュメント | ⭐推奨 |
| `terms.html` / `privacy.html` | 規約（外部API使用時等） | △ |

### `wrangler.toml` 最小構成（静的アセット）
```toml
name = "myapp"                    # ← Workerのサブドメインになる
compatibility_date = "2025-06-01"

[assets]
directory = "."                   # リポジトリのルートを配信
```

### `manifest.webmanifest` テンプレ
```json
{
  "name": "MyApp",
  "short_name": "MyApp",
  "lang": "ja",
  "start_url": "index.html",
  "scope": ".",
  "display": "standalone",
  "background_color": "#f4f6f9",
  "theme_color": "#0066cc",
  "icons": [
    { "src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }
  ]
}
```

### `sw.js` テンプレ（シェルキャッシュ＋APIはネット）
```javascript
var CACHE = "myapp-v1";
var ASSETS = ["index.html", "manifest.webmanifest", "icon.svg"];

self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 外部API（OSM等）はキャッシュせずネット直
  if (/api|tile/.test(new URL(e.request.url).host)) return;
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});
```

---

## 🛠️ デプロイ手順（10ステップ）

### Phase 1: GitHub
1. リポジトリを作成（Public/Privateどちらでも可）
2. 上記ファイル一式を push

### Phase 2: Cloudflare Workers
3. https://dash.cloudflare.com → **Workers & Pages → Create application**
4. **Connect to Git** → リポジトリを選択
5. **Project name** を決める（= URLのサブドメイン部分）
6. Build command: 空欄 / Deploy command: `npx wrangler deploy`
7. **Deploy** → `<projectname>.<account>.workers.dev` で配信開始

### Phase 3: Cloudflare Access（プライベート化）
8. 左メニュー **Zero Trust** → 初回は Team名作成 + **Free プラン** 選択（カード登録は形式、無料枠50ユーザー）
9. **Access controls → Applications → Add application → Self-hosted**
   - Type タブ: **Workers** を選択（`*.workers.dev` 保護に必須）
   - Public hostnames: Subdomain `<projectname>` + Domain `<account>.workers.dev`
10. **Access policies → Create new policy**
    - Action: **Allow**
    - Include → **Emails** → 自分のメールアドレス
    - Name: 任意（例: `Only me`）
    - Save → 最後に **Create** で完成

### 動作確認
- シークレットウィンドウで URL を開く → Cloudflare Access のログイン画面
- メール入力 → PINがGmailに届く → 入力 → アプリ表示
- 他のメールでは弾かれる（default-deny）

---

## ⚠️ ハマりどころと対処

### 1. Cloudflare Pages か Workers か
- **静的サイトなら Pages がやや楽**だが、Workers でも `[assets]` で同じことができる
- 今回は Workers でデプロイ（手順は同じ）

### 2. Identity Provider（IdP）が空に見える
- Zero Trust Free では **One-time PIN がデフォルト内蔵**で動く
- 「Accept all available identity providers」ON のままで OK
- 不安なら Access settings → Login methods で確認

### 3. force push 禁止環境
- `git push --force` が使えない場合の対処：
  ```
  git fetch origin main
  git merge origin/main -X ours -m "Merge main"
  git push origin <branch>
  ```
- squash マージ後の乖離はこれで解消

### 4. PIN コード入力エラー
- 「指定されている形式で入力してください」→ メールの数字部分だけコピペ（スペース/ハイフン除去）

### 5. ドメイン候補に出ない
- Access で `*.workers.dev` を選びたい時 → Self-hosted の **Workers タブ**を選択

---

## 🎨 アプリ機能テンプレ（あると便利）

UI/UX で「個人アプリらしさ」を出す機能：

| 機能 | 実装 | 効果 |
|---|---|---|
| 起動時自動アクション | `init()` で前回設定読み込み＋実行 | 開いたら即使える |
| 設定記憶 | `localStorage` に保存 | 毎回設定不要 |
| お気に入り | `localStorage` の JSON | 個人化 |
| PWA | manifest + sw.js | ホーム画面追加 |
| 経路案内連携 | Google Maps URLスキーム | 外部アプリ起動 |
| 色分けピン | Leaflet `divIcon` + SVG | 視認性UP |

### Google Maps 徒歩ナビ起動URL
```
https://www.google.com/maps/dir/?api=1&destination=<lat>,<lon>&travelmode=walking
```

### Service Worker キャッシュバージョニング
更新時は `CACHE = "myapp-v2"` のように番号を上げる → 自動で古いキャッシュ削除。

---

## 💰 コスト構造（2026年時点）

| サービス | 無料枠 | 個人利用想定 |
|---|---|---|
| GitHub | Public無制限 / Private 2,000分Actions | ✅余裕 |
| Cloudflare Workers | 100,000 req/日 | ✅余裕 |
| Cloudflare Access (Zero Trust Free) | 50ユーザー | ✅本人だけなら永久 |
| Cloudflare DNS / Tiles 経由 | 無制限 | ✅ |

**合計: $0/月**（カード登録は形式上必要、実課金はゼロ）

---

## 🔁 拡張パターン

### 完全分離（複数アプリ運用）
- 規約・ポリシーホスティング用リポと、アプリ本体リポを**分離**する
- 例: `mempalace-policy` (規約) と `freewifi` (アプリ) を別リポに

### 複数ユーザー許可
- Access policy の Include → Emails に複数追加、または `Email domain` で `@company.com` 等

### カスタムドメイン
- Cloudflare で独自ドメインを管理している場合、Workers Routes で割当可能
- Access ドメインも独自ドメインで指定可

### 機能フラグ
- localStorage で機能ON/OFFを切替 → 設定画面不要で開発者用フラグを足せる

---

## 📚 参考URL

- Cloudflare Workers Static Assets: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare Access (Zero Trust): https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/
- Leaflet (地図): https://leafletjs.com/
- OpenStreetMap Overpass: https://wiki.openstreetmap.org/wiki/Overpass_API
- Nominatim (ジオコーディング): https://nominatim.org/

---

## 🏁 まとめ

「**Cloudflare Workers + Access**」の組み合わせは、**個人専用Webアプリ**の最適解の1つ:
- バックエンド不要 → 開発が単純
- PWAでスマホアプリ感 → UX良好
- 認証は Cloudflare 任せ → セキュリティを自前で組まない
- 無料 → ランニングコストゼロ

次回似たようなアプリ（家計簿、メモ、TODO、ダッシュボード等）を作る時もこのファイル構成と手順で即座に展開できる。
