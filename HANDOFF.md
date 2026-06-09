# FreeWiFi Finder — 引き継ぎメモ（HANDOFF）

新セッションではこのファイルを読めば文脈を引き継げます。

## リポジトリ / ブランチ
- repo: `non-x2/mempalace-policy`
- 作業ブランチ: `claude/free-wifi-finder-app-zc1bsz`
- 本番: `main`（GitHub Pages 配信）
- 公開URL（想定）: https://non-x2.github.io/mempalace-policy/wifi.html
  ※ GitHub Pages は Settings→Pages で `main` / `(root)` を有効化する前提

## アプリ概要
- 無料WiFiスポット検索アプリ。単一HTML（`wifi.html`）＋PWA。バックエンド/APIキー不要。
- データ: OpenStreetMap（Overpass API 検索 / Nominatim 地名検索）。
- ファイル: `wifi.html`（本体）, `manifest.webmanifest`, `sw.js`, `icon.svg`, `README.md`,
  既存ポリシー: `index.html`, `terms.html`, `privacy.html`

## 実装済み機能
- 現在地検索 / 地図(Leaflet)＋近い順一覧 / 検索範囲 500m〜5km
- Overpass 網羅クエリ（`internet_access` が no/false/none 以外を全取得）
- 料金分類バッジ＆色分けピン（緑=無料/橙=店舗利用者向け/赤=有料）
- 🧭 経路案内リンク / 🔍 地名検索 / 🆓 無料のみ絞り込み＋詳細(営業時間/SSID/運営者)
- ⭐ お気に入り(localStorage) / 📱 PWA(ホーム画面追加・SW キャッシュ 現在 v2)
- 🚀 起動時自動検索 / 🔄 エリア再検索ボタン / 📍 現在地ボタン / 💾 設定記憶

## 重要な注意点
- Webアプリは実際のWiFi電波をスキャン不可。表示は「OSMに登録済みのWiFiのみ」。
- デプロイは squash マージのため毎回ブランチが main から乖離する。対処手順:
  ブランチで変更commit → `git fetch origin main`
  → `git merge origin/main -X ours -m "..."` → push（force不要）→ PR作成 → squashマージ。
  ※ force push は環境で禁止。
- この実行環境のネットワーク許可リストで overpass/nominatim/github.io へは到達不可。
  動作確認は利用者のブラウザで行う（クライアント動作のため実害なし）。

## 未決タスク: プライベート化
本人だけアクセス可能にしたい。静的公開サイトのためページ内パスワードは真の保護にならない。
- **本命: Cloudflare Pages + Access**（無料・本格認証）。手順は `README.md` に記載済み。
  ユーザーのCloudflareアカウントで Pages接続 → Zero Trust/Access で Allow Emails に
  本人メール(nobu.n0229@gmail.com)を設定。
- **暫定: 簡易パスコードロック**（wifi.html にゲートを追加）。casual な目隠しのみ。
- 進め方を選択 → 実装/案内する。
