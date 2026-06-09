# 🖥️ デスクトップ版 Claude Code 引き継ぎメモ

> Web版 Claude Code で進めてきた FreeWiFi Finder プロジェクトを、
> **デスクトップ（ローカル）版 Claude Code** から続けるためのガイド。
> まずこのファイルを Claude に読ませてから作業を始めること。

---

## ▶️ 最初にやること（コピペで実行）

```bash
# 1. リポジトリをクローン
git clone https://github.com/non-x2/mempalace-policy.git
cd mempalace-policy

# 2. 最新を取得
git checkout main && git pull

# 3. ドキュメントを読む（プロジェクトの全文脈）
#    HANDOFF.md        … プロジェクト全体の状態
#    PATTERN.md        … 個人専用アプリ構築の「型」
#    PLAN2_HANDOFF.md  … リポジトリ完全分離の手順（次の大タスク）
#    DESKTOP_HANDOFF.md… このファイル
```

Claude には:
> 「`HANDOFF.md` と `PLAN2_HANDOFF.md` を読んでプロジェクトを引き継いで」
と伝える。

---

## 🌐 Web版とデスクトップ版の違い（重要）

デスクトップ版は**制約がほぼ無く、できることが大幅に増える**:

| 項目 | Web版（これまで） | デスクトップ版（これから） |
|---|---|---|
| GitHub操作 | MCP経由、`mempalace-policy` のみ | **`gh` CLI で全リポOK**。新リポ作成・別リポpushも自由 |
| `git push --force` | ❌ 環境で禁止 | ✅ 使える（ローカルgit） |
| ネットワーク | 許可リスト制限（OSM/workers.dev到達不可） | ✅ 制限なし。`curl` でOverpass/Nominatim実テスト可 |
| Cloudflare | ブラウザ手動のみ | ✅ **`wrangler` CLI**でデプロイ/管理。**API token**でAccessも自動化可 |
| ローカル動作確認 | 不可 | ✅ `python3 -m http.server` で実機テスト可 |

### つまりデスクトップ版でできるようになること
1. **plan 2（リポジトリ完全分離）を全自動で実行**できる（`gh repo create` + push）
2. **Cloudflare のデプロイを `wrangler` CLI で実行**できる（ブラウザ往復が減る）
3. **アプリの実動作テスト**（位置情報以外のロジック）がローカルで可能
4. **force push が必要な整理**も自由にできる

---

## 📦 現在の状態（2026-06-09 時点）

### リポジトリ: `non-x2/mempalace-policy`（1リポジトリ兼用中）
- **規約ホスティング**: `index.html`(現FreeWiFi版), `terms.html`, `privacy.html`, `tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt`
- **FreeWiFiアプリ**: `wifi.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `wrangler.toml`
- **ドキュメント**: `README.md`, `HANDOFF.md`, `PATTERN.md`, `PLAN2_HANDOFF.md`, `DESKTOP_HANDOFF.md`

### デプロイ状況
- **Cloudflare Worker**: `freewifi` プロジェクト稼働中
  - URL: `https://freewifi.nobu-n0229.workers.dev/wifi.html`
  - 参照リポジトリ: `non-x2/mempalace-policy`（main push で自動デプロイ）
  - `wrangler.toml`: `name = "freewifi"`
- **Cloudflare Access**: 設定済み・稼働中 ✅
  - Application: self-hosted、Destination = `freewifi.nobu-n0229.workers.dev`
  - Policy `Only me`: Allow + Emails = `nobu.n0229@gmail.com`
  - 認証: One-time PIN（メールにコード）
  - Team domain: `twilight-art-b463.cloudflareaccess.com`
  - プラン: Zero Trust Free（$0/月、50席）

### ✅ 完了済み
- アプリ開発（全機能）
- Cloudflare Workers デプロイ
- Cloudflare Access による本人限定アクセス（**動作確認済み**）

### ⏳ 残タスク
1. **plan 2: リポジトリ完全分離** → 詳細は `PLAN2_HANDOFF.md`
2. （任意）追加機能: マーカークラスタリング / ダークモード / 多言語 / 自治体オープンデータ追加

---

## 🚀 plan 2 をデスクトップ版で実行する場合

`PLAN2_HANDOFF.md` の手順を、デスクトップでは**MCP不要・CLIで全自動**にできる:

```bash
# 新リポジトリ作成（gh CLI）
gh repo create non-x2/freewifi --public \
  --description "現在地周辺の無料WiFiスポットを探すアプリ (FreeWiFi Finder)"

# FreeWiFi 関連ファイルだけを新リポへ
mkdir ../freewifi && cd ../freewifi
git init
# mempalace-policy から対象ファイルをコピー
cp ../mempalace-policy/{wifi.html,manifest.webmanifest,sw.js,icon.svg,wrangler.toml,index.html,README.md,PATTERN.md} .
git add . && git commit -m "Initial commit: FreeWiFi Finder (separated from mempalace-policy)"
git branch -M main
git remote add origin https://github.com/non-x2/freewifi.git
git push -u origin main

# mempalace-policy を規約専用に戻す（別ブランチ→PR推奨）
cd ../mempalace-policy
git checkout -b cleanup/restore-mempalace-only
git rm wifi.html manifest.webmanifest sw.js icon.svg wrangler.toml README.md PATTERN.md HANDOFF.md PLAN2_HANDOFF.md DESKTOP_HANDOFF.md
# index.html を MemPalace版へ戻す（PLAN2_HANDOFF.md の Step 2 のコードを使用）
# ... index.html を書き換え ...
git add -A && git commit -m "Restore mempalace-policy to original (separate FreeWiFi)"
git push -u origin cleanup/restore-mempalace-only
gh pr create --fill
```

その後 **Cloudflare 側**:
- `wrangler` CLI が使えるので、新リポで `npx wrangler deploy` も可能
- ただし Worker の Git 連携先変更はダッシュボード操作が確実（または `wrangler` の CI 連携を貼り直し）

> ⚠️ `PLAN2_HANDOFF.md` の「絶対に壊してはいけないもの」（TikTok確認ファイル等）と
> 「動作検証」「ロールバック」セクションは必ず守ること。

---

## 🔧 Cloudflare を CLI / API で操作したい場合（任意・上級）

デスクトップ版なら、ブラウザ往復を減らせる:

### wrangler（Workers デプロイ）
```bash
npm install -g wrangler   # または npx wrangler
wrangler login            # ブラウザで一度だけ認証
cd freewifi
wrangler deploy           # wrangler.toml を読んでデプロイ
```

### Cloudflare API（Access を自動化したい場合）
- Cloudflare ダッシュボード → My Profile → API Tokens で **API Token** を発行
- 環境変数に設定: `export CLOUDFLARE_API_TOKEN=xxxx`
- Access Application / Policy は API or Terraform で管理可能
  - 参考: https://developers.cloudflare.com/api/operations/access-applications-list-access-applications
- ※ ただし**現状 Access はもう設定済みで動いている**ので、再設定は不要。
  URL（`freewifi.nobu-n0229.workers.dev`）が変わらない限り Access はそのまま有効。

---

## 🧪 ローカルでアプリをテストする

```bash
cd mempalace-policy   # または freewifi
python3 -m http.server 8000
# ブラウザで http://localhost:8000/wifi.html
```

- `localhost` は secure context 扱いなので**位置情報APIも動く**
- Overpass/Nominatim へもデスクトップなら到達できるので**実データで検索テスト可能**
- `file://` 直開きは位置情報が使えないので必ず `http://localhost` で

---

## ⚠️ Claude Code（デスクトップ版）でも依然できないこと

- **ブラウザの自動操作はできない**（Cloudflareダッシュボードのクリック作業はユーザー手動）
  - ただし `wrangler` / Cloudflare API である程度代替可能
- **TikTok等のSNS審査ダッシュボード操作**もユーザー手動

---

## 📌 重要メモ（再掲）

- TikTok確認ファイル `tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt` は移動・削除しない
- 利用規約 `terms.html` / プライバシー `privacy.html` のURLは維持する
- TikTokに登録した規約URLが GitHub Pages なのか Worker なのか、plan 2 実行前にユーザーへ確認する
- メール `nobu.n0229@gmail.com` が Cloudflare Access の許可対象

---

## 🔗 リンク集

| 対象 | URL |
|---|---|
| アプリ（Access保護） | https://freewifi.nobu-n0229.workers.dev/wifi.html |
| リポジトリ | https://github.com/non-x2/mempalace-policy |
| Cloudflare ダッシュボード | https://dash.cloudflare.com |
| Zero Trust | https://one.dash.cloudflare.com |

---

## 🏁 デスクトップ版での推奨フロー

1. `git clone` → ドキュメント4種を読む
2. 必要なら `gh auth status` / `wrangler whoami` で認証確認
3. plan 2 を実行するなら上記スクリプト＋`PLAN2_HANDOFF.md` に沿って進める
4. 追加機能はローカルで開発→`python3 -m http.server`で確認→push（自動デプロイ）
5. Cloudflare の手動操作が必要な箇所だけユーザーに依頼

これでデスクトップ版 Claude Code からシームレスに続行できる。
