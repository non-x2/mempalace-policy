# FreeWiFi Finder

現在地周辺の**無料WiFiスポット**を地図と一覧で探せる単一ページアプリ（`wifi.html`）。
バックエンド不要・APIキー不要。OpenStreetMap のオープンデータ（Overpass API）を利用。

## 主な機能
- 📍 現在地検索／🗺️ 地図＋近い順一覧／📏 検索範囲 500m〜5km
- 🚀 **起動時に自動検索**（前回地点を即表示→現在地で更新）／🔄 地図移動で「このエリアを再検索」
- 📌 **料金で色分けピン**（緑=無料・橙=店舗利用者向け・赤=有料）／📍 現在地に戻るボタン
- 💾 **設定・前回地点を記憶**（範囲・無料のみ・位置を localStorage に保存）
- 🧭 **経路案内**: 各スポットからマップアプリの徒歩ナビを起動
- 🔍 **地名検索**: 「渋谷駅」等を入力して目的地周辺を事前チェック（Nominatim）
- 🆓 **無料のみ絞り込み** ＋ 営業時間・SSID・運営者などの詳細表示
- 料金分類バッジ（無料／店舗利用者向け／有料）
- ⭐ **お気に入り**: 端末内（localStorage）に保存・一覧表示
- 📱 **PWA**: ホーム画面に追加してアプリのように起動（`manifest.webmanifest` / `sw.js` / `icon.svg`）

> ⚠️ 表示できるのは OpenStreetMap に登録済みのWiFi情報のみ。Webアプリは仕様上、実際に飛んでいる
> WiFi電波をスキャンできないため「周囲の全WiFi」ではなく「地図データに登録された範囲」を表示します。

## ファイル
| ファイル | 役割 |
|---|---|
| `wifi.html` | アプリ本体 |
| `manifest.webmanifest` | PWA マニフェスト |
| `sw.js` | Service Worker（シェルをキャッシュ／検索APIは常にネット） |
| `icon.svg` | アプリアイコン |

## ローカルで試す
```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000/wifi.html を開く
```
> ⚠️ `file://` で直接開くと位置情報APIが使えません。必ず `localhost` か HTTPS 経由で開いてください。

---

## 自分専用で公開する（スマホで外でも使う）

GitHub Pages は無料プランだとURLを知れば誰でも見られてしまうため、
**Cloudflare Pages + Cloudflare Access** でアクセス制限をかけます（無料・自分のGoogleアカウントのみ許可）。

### 手順
1. **Cloudflare アカウント**を作成（無料） → https://dash.cloudflare.com/sign-up
2. **Workers & Pages → Create → Pages → Connect to Git** で、このリポジトリ `mempalace-policy` を接続。
   - Production branch: `main`（このアプリを `main` にマージしておく）
   - Build command: なし（空欄） / Output directory: `/`（ルート）
   - デプロイ後、`https://<project>.pages.dev/wifi.html` で配信される。
3. **アクセス制限を追加（Zero Trust / Access）**
   - 左メニュー **Zero Trust → Access → Applications → Add an application → Self-hosted**
   - Application domain に Pages のドメイン（例 `xxxx.pages.dev`）を指定
   - **Policy** で `Action: Allow`、`Include → Emails → nobu.n0229@gmail.com` を設定
   - これで、このメールでログインした本人だけがアクセス可能（他人はブロック）

### ポイント
- HTTPS で配信されるので位置情報の許可ダイアログが出て、スマホでそのまま使える。
- Overpass API はブラウザから直接叩く（CORS対応済み）ため追加設定は不要。
- Cloudflare Access の無料枠は最大50ユーザーまで。1人利用なら十分。

---

## ファイル構成
| ファイル | 内容 |
|---|---|
| `wifi.html` | アプリ本体（依存はCDNのみ） |
| `index.html` | トップ（アプリへの導線リンクあり） |
| `terms.html` / `privacy.html` | 規約・プライバシーポリシー |

データ提供: © OpenStreetMap contributors（ODbL）／ 検索: Overpass API
