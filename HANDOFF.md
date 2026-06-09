# FreeWiFi Finder — 引き継ぎメモ（HANDOFF）

> このファイルを最初に読めば、新セッションで作業を引き継げます。

## 📅 最新状態（2026-06-09）

### リポジトリ構成（plan 2-β: 1リポジトリで2つの目的を兼用中）
`non-x2/mempalace-policy` は現在2つの用途を兼ねています:

1. **MemPalace AutoPost の規約ホスティング**（オリジナル用途・温存）
   - `terms.html` — 利用規約
   - `privacy.html` — プライバシーポリシー
   - `tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt` — **TikTok ドメイン所有確認ファイル**（移動禁止）

2. **FreeWiFi Finder アプリ**（後から追加）
   - `wifi.html` — アプリ本体
   - `manifest.webmanifest`, `sw.js`, `icon.svg` — PWA関連
   - `wrangler.toml` — Cloudflare Workers 設定（`name = "freewifi"`）
   - `README.md` — 機能ドキュメント

3. **共有（一時的）**
   - `index.html` — 現在 "FreeWiFi Finder" 表示。元は "MemPalace AutoPost"。
     plan 2 完遂時に MemPalace 版へ戻す。

### デプロイ状況
- **GitHub Pages**: `https://non-x2.github.io/mempalace-policy/` で公開中
- **Cloudflare Worker**:
  - 旧: `mempalace-policy.nobu-n0229.workers.dev` ←本セッション中にユーザーが削除予定
  - 新: `freewifi.nobu-n0229.workers.dev` ←ユーザーが新規作成予定（同じリポジトリを参照）
  - 自動再デプロイ: `main` push で発火

### 🔐 プライベート化（Cloudflare Access）
- **未完了**。Worker 配信までは完了。Access設定が残っている。
- 設定手順:
  1. Cloudflare → Zero Trust（初回はチーム名作成、Free プラン選択）
  2. Access → Applications → Add → Self-hosted
  3. ドメイン: `freewifi.nobu-n0229.workers.dev`
  4. Policy: Action=Allow, Include → Emails → `nobu.n0229@gmail.com`

---

## 🎯 新セッションでの目的

### 1. 検証（必須）
- 新URL `https://freewifi.nobu-n0229.workers.dev/wifi.html` で全機能が動作するか確認:
  - 起動時自動現在地検索 / 地名検索 / 検索範囲切替
  - 色分けピン（緑=無料/橙=店舗向け/赤=有料）
  - 経路案内リンク（Googleマップ起動）
  - 無料のみ絞り込み / 詳細表示
  - お気に入り保存 / お気に入りビュー
  - エリア再検索ボタン / 現在地ボタン
  - PWA（ホーム画面追加）
- Cloudflare Access の本人限定アクセスが効いているか（他端末/シークレットでログイン要求が出るか）

### 2. plan 2 の完遂（オプション・要権限拡張）
**目的**: 2リポジトリに完全分離して整理。
- `non-x2/mempalace-policy` … 規約ファイルのみ
- `non-x2/freewifi` … FreeWiFi アプリ一式

**前提**: 本セッションでは GitHub MCP の権限が `non-x2/mempalace-policy` のみで、新リポジトリ作成・別リポへの push ができず断念。
**新セッションでの対応**: Claude Code on the web の権限設定で **全リポジトリの読み書き＋作成権限** を付与してから開始すること。

**分離手順**:
1. `non-x2/freewifi` を新規作成（Public、Add README）
2. 以下を `freewifi` リポジトリへ移動（コピー）:
   - `wifi.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `wrangler.toml`, `README.md`, `HANDOFF.md`
   - `index.html` は FreeWiFi 版（現状のもの）
3. `mempalace-policy` を MemPalace 専用に戻す:
   - 上記 FreeWiFi 関連ファイルを削除
   - `index.html` を **元の MemPalace AutoPost 版**に復元（下記）
   - 残すファイル: `terms.html`, `privacy.html`, `tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt`, `index.html`
4. Cloudflare Worker `freewifi` のリポジトリ参照を `non-x2/freewifi` へ変更
5. 旧 Access ポリシーが新URLで効くか再確認

**元の MemPalace AutoPost 版 `index.html`**（plan 2 完遂時に復元）:
```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MemPalace AutoPost</title>
<style>
body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
h1 { color: #333; }
a { color: #0066cc; }
</style>
</head>
<body>
<h1>MemPalace AutoPost</h1>
<p>自動コンテンツ投稿・管理ツール</p>
<ul>
<li><a href="terms.html">利用規約</a></li>
<li><a href="privacy.html">プライバシーポリシー</a></li>
</ul>
</body>
</html>
```

---

## 🛠️ 開発ワークフロー（重要な制約）

- 作業ブランチ: `claude/free-wifi-finder-app-zc1bsz`
- マージ方式: **squash マージ**
- 副作用: squash により main とブランチが乖離するため、毎回:
  ```
  git fetch origin main
  git merge origin/main -X ours -m "Merge main"
  git push origin claude/free-wifi-finder-app-zc1bsz
  ```
- `git push --force` は環境で禁止（force push 不可）

## 🌐 ネットワーク制約（環境特有）

この実行環境のネットワーク許可リストで以下は到達不可:
- `overpass-api.de` / `nominatim.openstreetmap.org` / `*.tile.openstreetmap.org`
- `non-x2.github.io` / `*.workers.dev`

→ アプリの動作確認は**利用者のブラウザ**で行う（クライアントサイド動作のため実害なし）。

---

## 📱 アプリ概要

無料WiFiスポット検索 PWA。単一HTML + 依存はCDN（Leaflet）のみ。

### データソース
- 検索: OpenStreetMap **Overpass API**（複数エンドポイントへフォールバック）
- 地名検索: **Nominatim**
- 地図タイル: OpenStreetMap タイル

### 実装済み機能
- 起動時自動現在地検索（前回地点を即表示→現在地で更新）
- 地図クリック検索 / 地名検索 / 検索範囲 500m〜5km
- 色分けピン（緑=無料 / 橙=店舗利用者向け / 赤=有料）
- 経路案内リンク（Googleマップ徒歩ナビ）
- 無料のみ絞り込みトグル / 営業時間・SSID・運営者の詳細表示
- お気に入り (localStorage) / お気に入りビュー
- PWA（manifest.webmanifest, sw.js, icon.svg）
- 起動時設定復元（範囲・無料のみ・前回位置）
- エリア再検索ボタン / 現在地に戻るボタン

### 重要な制限
- ブラウザは仕様上 WiFi 電波をスキャン不可 → 表示は **OSM に登録済みのWiFiのみ**
- 都市部はカバレッジ高、地方・住宅街は低い

---

## 📧 連絡先・認証
- メール: `nobu.n0229@gmail.com`（Cloudflare Access の Allow リスト対象）

---

## 過去の変更履歴サマリ
- PR #2: 初回アプリ追加
- PR #3: Overpass クエリの網羅性改善
- PR #4: 経路案内・地名検索・絞り込み・お気に入り・PWA 化
- PR #5: 自動現在地検索・色分けピン・エリア再検索・設定記憶
- PR #6: HANDOFF.md 追加
- PR #7: `wrangler.toml` 追加（Cloudflare Workers アセット配信用）
- PR #8: `wrangler.toml` の `name` を `freewifi` に変更、`index.html` を FreeWiFi Finder 版に
