# カスタムドメイン設定手順

GitHub Pagesに独自サブドメイン（例：`seminar.example.com`）を割り当てる手順です。

## 全体フロー

1. **ドメインを取得**（まだの場合）
2. **DNSプロバイダを決める**
3. **使うサブドメインを決める**（例：`seminar`）
4. **DNSにCNAMEレコードを追加**
5. **リポジトリに `CNAME` ファイルを追加**
6. **GitHub Pages 側でカスタムドメインを設定**
7. **HTTPSを有効化**

---

## 1. ドメイン取得（推奨レジストラ）

| サービス | 特徴 | 価格目安/年 |
|---|---|---|
| **Cloudflare Registrar** | 卸価格、Privacy・DNS無料、最速。**最推奨** | 約¥1,200〜 |
| お名前.com | 国内最大手、UI日本語 | 約¥1,000〜（更新時上昇） |
| Value-Domain | 老舗、安定 | 約¥1,500〜 |
| Google Domains（→ Squarespace） | 移行中。新規取得は別レジストラを推奨 | — |

ドメイン名の候補例：
- `pinthome.com` / `pinthome.jp`
- `pint-home.jp`
- `pinthome.house`（新gTLD）
- 既存ブランドドメインがあればそれを利用

## 2. DNSプロバイダ

ドメイン取得時に付属するDNSをそのまま使ってもよいですが、**Cloudflare DNS**（無料）への移管を推奨：

- DDoS耐性・キャッシュ・Analytics・Bot対策などが無料
- Pages系のCNAME反映が高速
- 将来的にWAFやWorkersなど拡張可能

## 3. サブドメイン候補

| サブドメイン | 想定 |
|---|---|
| `seminar.<ドメイン>` | 勉強会全般のハブ（推奨） |
| `study.<ドメイン>` | 学び系の総合 |
| `school.<ドメイン>` | スクール感を出す |
| `lp.<ドメイン>` | LP汎用 |
| `2026-05.<ドメイン>` | 月次イベントごとに分ける場合 |

## 4. DNS設定（CNAMEレコード追加）

例：`seminar.pinthome.com` を使う場合

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `seminar` | `pinthome.github.io` | Auto / 3600 |

**注意**：
- ルートドメイン（`@`）には CNAMEを設定できません。ルート利用なら **Aレコード4本**を以下のIPに設定してください（GitHub Pages公式）：
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- AAAAレコード（IPv6）も対応する場合：
  - `2606:50c0:8000::153`
  - `2606:50c0:8001::153`
  - `2606:50c0:8002::153`
  - `2606:50c0:8003::153`

## 5. リポジトリに CNAME ファイル追加

リポジトリ直下に `CNAME` という名前のテキストファイルを作成し、**1行だけFQDN**を記載：

```
seminar.pinthome.com
```

このファイルはGitHub Pagesが読み取ってカスタムドメインとして認識します。

## 6. GitHub Pages 側の設定

```bash
gh api -X PUT repos/pinthome/housing-seminar/pages \
  --input - <<< '{"cname":"seminar.pinthome.com"}'
```

または GUI：Repository → Settings → Pages → Custom domain に入力 → Save。

## 7. HTTPS 有効化

DNS伝搬後（数分〜最大24時間）、GitHub PagesがLet's EncryptでTLS証明書を自動発行。

```bash
# 検証
gh api repos/pinthome/housing-seminar/pages
# → "https_certificate" が "approved" になればOK

# Enforce HTTPSを有効化
gh api -X PUT repos/pinthome/housing-seminar/pages \
  --input - <<< '{"https_enforced":true}'
```

---

## 動作確認

```bash
curl -sI https://seminar.pinthome.com | head -5
# HTTP/2 200 が返ればOK
```

---

## トラブルシューティング

| 症状 | 原因 | 対応 |
|---|---|---|
| `DNS check unsuccessful` | DNS伝搬待ち or レコード誤り | `dig seminar.<domain> CNAME` で確認 |
| `Both `www` and `apex` records` 警告 | DNS設定の重複 | 不要なAレコード削除 |
| HTTPS証明書エラー | 発行待ち（最大24時間） | しばらく待つ |
| `Custom domain check failed` | CNAMEファイルとSettingsが不一致 | リポジトリ直下の `CNAME` を確認 |

---

## ロールバック

カスタムドメインを外したい場合：

```bash
# GitHub Pages からドメイン削除
gh api -X PUT repos/pinthome/housing-seminar/pages \
  --input - <<< '{"cname":null}'

# CNAMEファイルを削除
rm CNAME && git add -A && git commit -m "Remove custom domain" && git push
```

`https://pinthome.github.io/housing-seminar/` に戻ります。
