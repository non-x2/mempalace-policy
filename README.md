# FreeWiFi Finder

現在地周辺の**無料WiFiスポット**を地図と一覧で探せる単一ページアプリ（`wifi.html`）。
バックエンド不要・APIキー不要。OpenStreetMap のオープンデータ（Overpass API）を利用。

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
   - **Policy** で `Action: Allow`、`Include → Emails → nonlabo.dev@gmail.com` を設定
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
