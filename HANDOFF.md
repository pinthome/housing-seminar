# 引き継ぎドキュメント — housing-seminar LP

このドキュメントは、本リポジトリを**別の担当者・別のGitHubアカウントへ移管**して、独立して運用 / デプロイできるようにするための完全ガイドです。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| 名称 | PINT HOME 月次オンライン住宅勉強会 LP |
| 公開URL | https://pinthome.github.io/housing-seminar/ |
| リポジトリ | https://github.com/pinthome/housing-seminar |
| 構成 | 単一ファイル（`index.html`）+ 軽量JS（`scripts.js`）+ 静的アセット |
| デプロイ | GitHub Pages（mainブランチ直下を配信） |
| ライセンス | 内部利用 |

---

## 2. ファイル構成

```
housing-seminar/
├── index.html              ← ★メインファイル（単一ファイル完結）
├── scripts.js              ← JS（モーダル・カウントアップ・ヘッダー挙動）
├── README.md               ← プロジェクト概要
├── SECURITY.md             ← セキュリティポリシー
├── HANDOFF.md              ← このファイル
├── .gitignore
├── .nojekyll               ← GitHub Pages の Jekyll を無効化
├── .well-known/
│   └── security.txt        ← RFC 9116
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       └── codeql.yml      ← CodeQL（毎週自動セキュリティスキャン）
├── docs/
│   └── CUSTOM-DOMAIN.md    ← 独自ドメイン設定手順（任意）
└── _source/                ← ★ローカルのみ（gitignore）／元写真
    ├── yuka-hero.jpg
    ├── yuka-avatar.jpg
    └── yuka-hero-2.JPG
```

### 重要：`_source/` は git管理外

- 講師（石井優香）の元写真3枚が入っています
- リポジトリには含まれていません（高解像度写真の公開を避けるため）
- 画像は `index.html` 内に **base64 で埋め込み済み** なので、サイト動作には不要
- ただし**今後画像を差し替え・再加工する**には必要 → 別途**直接ファイル共有**してください（zip / Drop / Slack など）

---

## 3. 移管手順（同僚アカウントへ）

### A. 最短ルート（推奨）

同僚側のローカル環境で以下を実行：

```bash
# 1) このリポジトリをclone（リネームしてもOK）
git clone https://github.com/pinthome/housing-seminar.git
cd housing-seminar

# 2) gitリモートを外す（元の origin を切り離し）
git remote remove origin

# 3) 同僚のGitHubアカウントに新リポジトリを作成 + push
#    リポジトリ名・公開設定は希望に応じて変更
gh repo create <YOUR_REPO_NAME> \
  --public \
  --source . \
  --push \
  --description "PINT HOME / 住宅勉強会LP"

# 4) GitHub Pages を有効化
gh api -X POST repos/<YOUR_USERNAME>/<YOUR_REPO_NAME>/pages \
  --input - <<< '{"source":{"branch":"main","path":"/"}}'

# 5) HTTPS強制
gh api -X PUT repos/<YOUR_USERNAME>/<YOUR_REPO_NAME>/pages \
  --input - <<< '{"https_enforced":true}'
```

### B. Web UI で移管したい場合

1. GitHub上で新規リポジトリ作成（Public推奨）
2. ローカルで `git remote set-url origin <新リポジトリのURL>`
3. `git push -u origin main`
4. GitHub Settings → Pages → Source: `main` `/(root)` → Save

### C. ClaudeCodeで自動化する場合

このHANDOFF.md自体をClaudeCodeに渡せば、上記Aの手順を自動実行できます。  
プロンプト例：

> 「このリポジトリ（https://github.com/pinthome/housing-seminar）を、僕のアカウント `<USERNAME>` の `<REPO>` にデプロイして。手順は HANDOFF.md セクション3を参照」

---

## 4. 外部サービス・埋め込みID

`index.html` 内で参照している外部サービス。**移管時もそのまま動作**します（PINT HOMEのautosns.jpアカウントに紐づくため）。

### autosns.jp 動画埋め込み（video.js）

| 動画ID | 内容 |
|---|---|
| `QgXdJFUGkN` | はじめての住宅購入勉強会（過去開催） |
| `nMWpbGukIm` | 住宅ローン勉強会（過去開催） |

### autosns.jp 予約カレンダー（proline-embed-calendar）

| 予約ID | 対応する勉強会 |
|---|---|
| `sjWJCp1SPM` | 5/14 はじめての住宅購入 |
| `N2JkCEiHel` | 5/15 住宅ローンの考え方 |
| `aeLlaQIFHb` | 5/21 住み替え |
| `FNZY6aF7Gd` | 5/19 築古 |

### 重要：URL末尾の `?uid=[[uid]]`

- LP上の予約UI・動画は **LINE公式アカウントのフォロワーにのみ表示** される設計です
- LP共有時のURLには必ず `?uid=[[uid]]` を付けて、LINE側で自動置換させてください
  - 例：`https://<your-domain>/?uid=[[uid]]`
- ブラウザ直アクセス（uidなし）では「予約できません」のエラー画面になります（仕様）

---

## 5. 編集時の注意

### 写真の差し替え

写真は `index.html` の `<img src="data:image/jpeg;base64,...">` として埋め込まれています。差し替えには Pythonで再生成が必要：

```bash
# yuka-hero.jpg / yuka-avatar.jpg を _source/ に置いた状態で
python3 <<'EOF'
from PIL import Image
import base64, io, re

def encode_jpeg(path, size, quality=82):
    img = Image.open(path).convert("RGB")
    img = img.resize((size, size), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    return base64.b64encode(buf.getvalue()).decode("ascii")

hero_b64 = encode_jpeg("_source/yuka-hero.jpg", 720, 82)
avatar_b64 = encode_jpeg("_source/yuka-avatar.jpg", 360, 82)

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()
# Replace the hero base64
html = re.sub(
    r'(<div class="hero-bg"[^>]*>\s*<img\s+src=")data:image/jpeg;base64,[^"]+(")',
    f'\\1data:image/jpeg;base64,{hero_b64}\\2',
    html
)
# Replace the avatar base64 (speaker-avatar)
html = re.sub(
    r'(<div class="speaker-avatar">\s*<img\s+src=")data:image/jpeg;base64,[^"]+(")',
    f'\\1data:image/jpeg;base64,{avatar_b64}\\2',
    html
)
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
EOF
```

### CSS / コピーの編集

- `index.html` 内の `<style>` ブロックを直接編集
- セクションごとにコメント `/* ===== Section name ===== */` で区切られています
- カラー・余白・フォントサイズは `:root` の CSS変数を経由

### CSP（Content Security Policy）

- `<meta http-equiv="Content-Security-Policy">` で設定済み
- autosns.jp の動的script実行のため `'unsafe-inline'` `'unsafe-eval'` 許可
- 新しい外部CDNを使う場合は **`script-src` または `style-src`** に追加が必要

---

## 6. 動作確認チェックリスト（デプロイ後）

```bash
BASE=https://<your-username>.github.io/<your-repo>

# 主要ファイル
curl -o /dev/null -s -w "Pages       : %{http_code}\n" "$BASE/"
curl -o /dev/null -s -w "scripts.js  : %{http_code}\n" "$BASE/scripts.js"
curl -o /dev/null -s -w "security.txt: %{http_code}\n" "$BASE/.well-known/security.txt"
```

すべて `200` であればデプロイ成功です。

ブラウザで実際に開いた時のチェックポイント：

- [ ] ヒーローの写真が表示される（base64画像）
- [ ] スクロール時にヘッダーに影がつく
- [ ] スタッツ（112組 / 100%）がカウントアップする
- [ ] 過去開催の動画2本が表示される（**uid 付きでアクセス時のみ**）
- [ ] 各勉強会カードの「この回を予約する」でモーダルが開く
- [ ] モーダル内で予約UIが表示される（**uid 付きでアクセス時のみ**）
- [ ] 最終CTA の4日程ボタンでも同じモーダルが開く
- [ ] FAQ がアコーディオン開閉する

---

## 7. セキュリティ機能（デフォルトで有効）

GitHub Pages にデプロイすると、以下も自動で動作します：

| 機能 | ファイル | 説明 |
|---|---|---|
| HTTPS強制 | （Pages設定） | Let's Encryptの証明書を自動発行 |
| CSP | `index.html` `<meta>` | XSS等の防御 |
| CodeQL | `.github/workflows/codeql.yml` | 毎週月曜のJSスキャン |
| Dependabot | `.github/dependabot.yml` | GitHub Actions の月次更新通知 |
| security.txt | `.well-known/security.txt` | 脆弱性報告窓口（RFC 9116） |
| Secret Scanning | （GitHub標準） | Public repoは自動有効 |

**移管後にも残しておいて問題ありません**（連絡先メールアドレスは適宜書き換えてください）：
- `SECURITY.md` の「メール宛先」
- `.well-known/security.txt` の `Contact:` 行

---

## 8. カスタムドメイン（オプション）

独自ドメイン（例: `seminar.example.com`）への割り当て手順は `docs/CUSTOM-DOMAIN.md` 参照。

---

## 9. 既知の制約・FAQ

### Q. プレビューやキャッシュが古いまま表示される
A. GitHub Pages は数分間キャッシュします。`⌘+Shift+R` で強制リロード、またはURL末尾に `?t=タイムスタンプ` を付けてください。

### Q. 予約UIが「予約できません」と表示される
A. URLに `?uid=[[uid]]` がない／`[[uid]]` のリテラル文字列のままになっている可能性があります。LINE公式アカウントのリッチメニューやメッセージから配信した場合のみ、`[[uid]]` がフォロワーのIDに自動置換されます。

### Q. 動画が再生できない
A. 同上の `uid` 仕様です。加えてiOS Safariで全画面ループに陥る場合は、`<video>` タグに `playsinline` 属性が付いているか確認してください（既に付与済み）。

### Q. CSP違反でJavaScriptが動かない
A. 開発者ツールのConsoleで違反内容を確認し、`<meta http-equiv="Content-Security-Policy">` の `script-src` / `style-src` に必要なドメインを追加してください。

---

## 10. 連絡先

- 元担当: shinya.n@pint.co.jp
- リポジトリ Issue / Discussions: https://github.com/pinthome/housing-seminar/issues
