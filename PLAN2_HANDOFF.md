# 📦 Plan 2 引き継ぎメモ — freewifi リポジトリ完全分離

> このファイル単体で plan 2 を完遂できるよう自己完結させた手順書。
> 新セッションで作業する前に、まず **必要な権限の確認** を済ませること。

---

## 🎯 目的

現在 `non-x2/mempalace-policy` リポジトリは **2つの目的を兼用中**:
1. MemPalace AutoPost の規約ホスティング（TikTok等の SNS 審査用）
2. FreeWiFi Finder アプリ本体

これを **2つのリポジトリに完全分離**して整理する:

| リポジトリ | 用途 | ファイル |
|---|---|---|
| `non-x2/mempalace-policy` | 規約のみ（元の用途に戻す） | `index.html`(MemPalace版), `terms.html`, `privacy.html`, `tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt` |
| `non-x2/freewifi` | FreeWiFi アプリ本体 | `wifi.html`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `wrangler.toml`, `index.html`(FreeWiFi版), `README.md`, `PATTERN.md` |

---

## ⚠️ 必須前提：新セッションで必要な権限

本セッションでは GitHub MCP の権限が `non-x2/mempalace-policy` のみに制限されており、新リポジトリ作成・別リポジトリへの push ができず実行を断念した。

**新セッション開始時に必ず確認:**
- [ ] GitHub MCP の repository scope に **`non-x2/mempalace-policy` と `non-x2/freewifi` の両方**が含まれている
- [ ] `mcp__github__create_repository` が呼べる（権限あり）
- [ ] `mcp__github__push_files` で `non-x2/freewifi` へ書き込める

権限が足りない場合は、まずユーザーに「Claude Code on the web の権限設定で**全リポジトリの読み書き＋作成権限**を付与してください」と依頼すること。

---

## 🛑 絶対に壊してはいけないもの

| ファイル | 理由 |
|---|---|
| `mempalace-policy/tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt` | **TikTokのドメイン所有確認ファイル**。動かすと TikTok アプリ審査が無効化される |
| `mempalace-policy/terms.html` | TikTok等のSNSプラットフォームに登録済みの利用規約URL |
| `mempalace-policy/privacy.html` | 同上、プライバシーポリシーURL |
| Cloudflare Access Policy（`Only me`） | 認証設定。URLが変わらなければ維持される |

これらは **`mempalace-policy` リポジトリに残し続ける**こと。コミット履歴を見ると初期コミットからずっと存在している。

---

## 📋 実行手順（9ステップ）

### Phase 1: 準備（読み取りのみ）

#### Step 1. 現状確認
```bash
# 現在の main の状態を取得
git fetch origin main
git checkout origin/main
ls -la
```

期待するファイル一覧:
- `HANDOFF.md` `PATTERN.md` `README.md` （プロジェクトメモ）
- `index.html` （現在は FreeWiFi Finder 表示）
- `manifest.webmanifest` `sw.js` `icon.svg` （PWA）
- `wifi.html` （アプリ本体）
- `wrangler.toml` （Cloudflare Workers設定、`name = "freewifi"`）
- `terms.html` `privacy.html` （MemPalace 規約）
- `tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt` （TikTok確認）

#### Step 2. 元の `index.html`（MemPalace版）を復元用に控えておく

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

### Phase 2: 新リポジトリ作成と FreeWiFi ファイル移動

#### Step 3. `non-x2/freewifi` リポジトリを作成

```
mcp__github__create_repository:
  name: freewifi
  organization: non-x2
  description: 現在地周辺の無料WiFiスポットを地図と一覧で探せるアプリ (FreeWiFi Finder)
  private: false
  autoInit: true
```

#### Step 4. FreeWiFi 関連ファイルを `non-x2/freewifi` へ push

以下のファイルを `mcp__github__push_files` で一括 push（main ブランチへ）:

**移動対象（mempalace-policy → freewifi）:**
- `wifi.html` — アプリ本体
- `manifest.webmanifest` — PWA マニフェスト
- `sw.js` — Service Worker
- `icon.svg` — アイコン
- `wrangler.toml` — Cloudflare 設定（`name = "freewifi"` のまま）
- `README.md` — FreeWiFi の機能ドキュメント
- `PATTERN.md` — 将来再利用する型のドキュメント
- `index.html` — 現在の FreeWiFi Finder 版

**注意**: `HANDOFF.md` と `PLAN2_HANDOFF.md`(本ファイル) は移行しなくてOK（mempalace-policy 側に残してもよい）。むしろ `freewifi` 側には**新規の README** だけがあれば十分。

コミットメッセージ例:
```
Initial commit: import FreeWiFi Finder from mempalace-policy

無料WiFiスポット検索アプリを mempalace-policy から完全分離。
- 単一HTML + PWA (manifest.webmanifest, sw.js, icon.svg)
- Cloudflare Workers でホスト (wrangler.toml)
- データソース: OpenStreetMap (Overpass + Nominatim)
```

#### Step 5. `freewifi` の動作確認

- リポジトリ URL: `https://github.com/non-x2/freewifi`
- 全ファイルが存在することを確認
- `wifi.html` がブラウザで読める形式であることを確認（できれば `https://raw.githubusercontent.com/non-x2/freewifi/main/wifi.html` で取得テスト）

### Phase 3: `mempalace-policy` を元の状態へ復元

#### Step 6. クリーンアップ用ブランチで FreeWiFi ファイルを削除

`non-x2/mempalace-policy` に対して:

1. ブランチ `cleanup/restore-mempalace-only` を作成
2. 以下のファイルを削除:
   - `wifi.html`
   - `manifest.webmanifest`
   - `sw.js`
   - `icon.svg`
   - `wrangler.toml`
   - `README.md`
   - `PATTERN.md`
   - `HANDOFF.md`
   - `PLAN2_HANDOFF.md`（本ファイル。必要なら freewifi 側に移してから削除）
3. `index.html` を Step 2 の MemPalace AutoPost 版で上書き
4. 残るファイル:
   - `index.html`（MemPalace 版に戻された）
   - `terms.html` `privacy.html`
   - `tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt`

#### Step 7. PR を作成してマージ

タイトル例: `Restore mempalace-policy to original state (separate FreeWiFi to non-x2/freewifi)`

本文:
```
FreeWiFi Finder を non-x2/freewifi に完全分離したため、
このリポジトリを元の MemPalace AutoPost 規約ホスティング専用の状態に戻す。

- index.html を MemPalace AutoPost 版に復元
- FreeWiFi 関連ファイルを削除
- 残るファイル: index.html, terms.html, privacy.html, tiktok確認ファイル

TikTok ドメイン所有確認ファイルおよび利用規約・プライバシーポリシーの
URL は変更なし（既存のSNS審査に影響しない）。
```

squash マージで `main` に反映。

### Phase 4: Cloudflare 再設定

#### Step 8. Cloudflare Worker のリポジトリ参照を変更

⚠️ **これはユーザーの手作業**（Cloudflare ダッシュボードで実施）

1. https://dash.cloudflare.com → Workers & Pages → **freewifi** を開く
2. **Settings** タブ → **Build & deploy** セクション
3. **Git connection**（Connected repository）の項目で **Reconnect** または **Edit**
4. リポジトリを `non-x2/mempalace-policy` から **`non-x2/freewifi`** に変更
5. Production branch: `main`
6. Save
7. **Deployments** タブで手動デプロイをトリガー（または `non-x2/freewifi` の main に空コミット）
8. ビルド成功を確認

#### Step 9. Cloudflare Access ポリシーの再確認

- URL は同じ `freewifi.nobu-n0229.workers.dev` のまま → **Access ポリシーは変更不要**
- ただし念のため:
  1. Zero Trust → Access controls → Applications → `freewifi`
  2. Destinations が `freewifi.nobu-n0229.workers.dev` のままか確認
  3. Policy `Only me` が `Allow + Emails: nobu.n0229@gmail.com` のままか確認

---

## ✅ 動作検証（必須）

### A. FreeWiFi アプリ
1. シークレットウィンドウで `https://freewifi.nobu-n0229.workers.dev/wifi.html`
2. Cloudflare Access ログイン画面 → メール入力 → PIN認証 → アプリ表示
3. 全機能テスト:
   - [ ] 起動時自動現在地検索
   - [ ] 地名検索（例: 「渋谷駅」）
   - [ ] 検索範囲切替（500m〜5km）
   - [ ] 色分けピン（緑=無料、橙=店舗向け、赤=有料）
   - [ ] 無料のみ絞り込みトグル
   - [ ] 経路案内リンク（Googleマップ徒歩ナビ起動）
   - [ ] お気に入り保存・お気に入りビュー
   - [ ] エリア再検索ボタン（地図を動かす）
   - [ ] 現在地に戻るボタン
   - [ ] PWA：ホーム画面に追加できるか

### B. MemPalace 規約ページ
1. GitHub Pages 設定がある場合: `https://non-x2.github.io/mempalace-policy/terms.html` で利用規約が表示される
2. `https://non-x2.github.io/mempalace-policy/privacy.html` でプライバシーポリシーが表示される
3. `https://non-x2.github.io/mempalace-policy/tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt` で確認ファイルが配信される
4. ※ GitHub Pages を使っていない場合、TikTok等で登録した URL が `mempalace-policy.*.workers.dev` などだった可能性も。**ユーザーに「TikTokに登録した規約URLは何ですか？」と確認**して、その URL が引き続き有効であることを確認する

---

## 🚨 ロールバック手順（万一壊れた場合）

### ケース1: freewifi の Worker が動かない
- Cloudflare Worker の Git connection を一旦 `non-x2/mempalace-policy` に戻す
- mempalace-policy の main にはまだ freewifi 関連ファイルが残っているのでアプリは復活する
- そこから原因調査

### ケース2: mempalace-policy の規約が見えない
- `git revert <cleanup PR の squash コミット>` で復元
- または `git push` で削除前の状態を main に戻す
- TikTok等で問題が起きていないか確認

### ケース3: TikTok 確認ファイルを誤って削除した
- 履歴から復元: `git show HEAD~1:tiktok4bdbfAMoRhFHdwhoQyxhkgkdDDPRirSv.txt > tiktok...txt`
- main に再コミット
- TikTok の Developer ダッシュボードで「Verify domain」を再実行

---

## 📂 移動するファイルの正本パス（参考）

最終状態でこのファイルが消えていても探せるよう、各ファイルが存在する場所のヒント:

| ファイル | 取得元 |
|---|---|
| すべての FreeWiFi 関連 | `non-x2/mempalace-policy` の最後の `main` ブランチ（plan 2 実行前） |
| 元の `index.html`(MemPalace版) | 本ファイルの Step 2 にインライン記載済 |
| `tiktok...txt` | リポジトリ初期コミットから不変、ファイル名そのままで存在 |

---

## 🔗 関連リソース

- アプリURL（変更なし）: https://freewifi.nobu-n0229.workers.dev/wifi.html
- 旧リポジトリ: https://github.com/non-x2/mempalace-policy
- 新リポジトリ（plan 2 実行後）: https://github.com/non-x2/freewifi
- Cloudflare ダッシュボード: https://dash.cloudflare.com
- メール（Access許可リスト）: `nobu.n0229@gmail.com`

---

## 📝 開発ワークフローの注意（再掲）

- 作業ブランチ慣習: `claude/<topic>` でブランチを切る
- マージ方式: **squash マージ**
- squash により main とブランチが乖離するため、毎回:
  ```
  git fetch origin main
  git merge origin/main -X ours -m "Merge main"
  git push origin <branch>
  ```
- `git push --force` は環境で**禁止**

---

## ✨ 完了の定義

このプランが完遂された状態とは:
- [ ] `https://github.com/non-x2/freewifi` が存在し、FreeWiFi アプリ一式が main にある
- [ ] `https://github.com/non-x2/mempalace-policy` の main が規約4ファイルだけになっている
- [ ] Cloudflare Worker `freewifi` が `non-x2/freewifi` リポジトリを参照している
- [ ] `https://freewifi.nobu-n0229.workers.dev/wifi.html` が引き続き Access 経由で動作する
- [ ] TikTok 等のSNS規約URL（mempalace-policy ベース）が壊れていない
- [ ] 動作検証 A・B 両方が緑

ここまで来たら本ファイル (`PLAN2_HANDOFF.md`) は不要なので削除して構わない（または `freewifi` リポジトリに「完了済み」ヘッダ付きで移動）。
