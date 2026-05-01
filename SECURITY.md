# Security Policy

## 脆弱性のご報告

本リポジトリおよび公開LP（https://pinthome.github.io/housing-seminar/）に関するセキュリティ上の問題を発見された場合は、**公開Issueを作成せず**、以下のいずれかの方法でご報告ください。

### 1. GitHub の Private Vulnerability Reporting（推奨）

リポジトリの **Security** タブから「Report a vulnerability」を選択し、非公開で報告できます。

### 2. メール

- 宛先: `shinya.n@pint.co.jp`
- 件名に `[Security] housing-seminar` を含めてください
- 含めていただきたい内容:
  - 問題の概要
  - 再現手順 / PoC
  - 影響範囲（XSS / CSRF / 情報漏洩 など）

## 対応方針

| 段階 | 目安 |
|---|---|
| 一次返信 | 7日以内 |
| 影響度評価・修正計画 | 14日以内 |
| 修正リリース | 重大度に応じて優先対応 |
| 公開（Issue/Advisory） | 修正リリース後 |

## サポート対象

- `main` ブランチ（GitHub Pages で公開中）

## 現在のセキュリティ対策

| 項目 | 内容 |
|---|---|
| 通信 | HTTPS 強制（GitHub Pages） |
| CSP | `<meta http-equiv="Content-Security-Policy">` で外部スクリプト・スタイルの取得元を限定 |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | カメラ／マイク／位置情報／FLoC を一括禁止 |
| インラインJS | 廃止し `scripts.js` に分離 |
| 外部リンク | `rel="noopener noreferrer"` 付与 |
| iframe埋め込み | `frame-ancestors 'none'` でクリックジャッキング防止 |
| 自動コードスキャン | GitHub Actions（CodeQL）で `javascript` を毎週解析 |

## 範囲外

- 静的ファイルのみで構成されており、サーバーサイドのアプリケーションロジックはありません
- 入力フォームを持たないため、サーバー側のXSS/SQLi等は範囲外です
- 個人情報の収集は行っていません（予約は埋め込み外部サービスに委譲）
