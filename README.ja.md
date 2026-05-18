# refinancier-mcp

> **refinancier の MCP クライアント — 不確実な資産に、意思決定できる信頼を**
> AI エージェント向けの意思決定インフラ。企業価値評価・因果推論・バリューアップ示唆を提供。

[![Status](https://img.shields.io/badge/status-Under%20Development-orange)](#)
[![MCP](https://img.shields.io/badge/MCP-1.x-blue)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[English README](README.md) | 日本語

---

## 🚧 開発中 (Under Development)

このパッケージは [refinancier-banks](https://refinancier-banks.com) の **クライアント側 MCP ラッパー** です。
refinancier の意思決定インテリジェンス API (企業価値評価、異常検知、バリューアップ示唆、因果推論、XAI 監査証跡) を [Model Context Protocol](https://modelcontextprotocol.io/) 経由で AI エージェントに公開します。

**現在の状態:** 6 ツール公開中 (Decision Intelligence + Compliance + Valuation + Causal DAG)。セルフサーブ利用は 2026 Q3 GA 予定。

**⚠️ 重要**: 一部の Quick エンドポイントは認証なしのデモ用です。本格的な機能セット (30+ ツール、認証つき) を試したい場合は [refinancier-banks](https://github.com/rascal-3/refinancier-banks) の Python MCP を直接利用するのが現状の推奨です。

早期アクセスは [refinancier-banks.com](https://refinancier-banks.com) または info@refinancier.jp までお問い合わせください。

---

## なぜ refinancier-mcp なのか?

| 機能 | 内容 |
|------|------|
| **企業価値評価** | 複数手法 (PER/PSR/DCF/純資産) + 無形資産プレミアム + 再現性 100% |
| **異常検知タイムライン** | 10 年財務 + EDINET + TDB + ニュースを 1 本の年表に統合 (4 カテゴリ異常) |
| **シナリオシミュレーション** | What-if + 反事実推論 (Do-calculus ベース) |
| **バリューアップ示唆** | 投資委員会 1 枚: 経営課題 Top 5、価値ドライバー、やる/待つ/やらない の推奨アクション |
| **XAI 監査証跡** | SHA-256 ハッシュチェーン + Neo4j。AI 判断の完全な再現性と改ざん防止を保証 |

**対象**: 地方銀行・M&A 仲介会社・PE/事業再生ファンド・事業会社の戦略部署 — 不確実性を監査可能な意思決定に翻訳すべきあらゆる場面。

---

## クイックスタート

### Claude Desktop / Claude Code

MCP 設定ファイル (`~/Library/Application Support/Claude/claude_desktop_config.json`) に追加:

```json
{
  "mcpServers": {
    "refinancier": {
      "command": "npx",
      "args": ["-y", "refinancier-mcp"],
      "env": {
        "REFINANCIER_API_KEY": "rfn_live_your_api_key"
      }
    }
  }
}
```

**注意 (nvm 利用者向け)**: PATH 上で古い Node.js (v14 未満) が新しい Node より優先される環境では、`command` に絶対パスを指定してください:

```json
"command": "/Users/YOUR_NAME/.nvm/versions/node/v22.x.x/bin/npx",
"env": {
  "PATH": "/Users/YOUR_NAME/.nvm/versions/node/v22.x.x/bin:/usr/local/bin:/usr/bin:/bin",
  "REFINANCIER_API_KEY": "rfn_live_..."
}
```

### ソースからビルド

```bash
git clone https://github.com/rascal-3/refinancier-mcp.git
cd refinancier-mcp
npm install
npm run build
npm start
```

### API キー

API キー (`rfn_live_*`) は refinancier 管理コンソールから発行します (現在プライベートベータ)。
早期アクセスは info@refinancier.jp までご連絡ください。

---

## 提供ツール (予定)

| ツール | 説明 |
|--------|------|
| `valuate_company` | 複数手法による企業価値評価 (再現性保証付き) |
| `get_anomaly_timeline` | 財務 / ガバナンス / 実行 / 戦略の 4 カテゴリ異常を時系列で検知 |
| `run_scenario` | What-if シナリオシミュレーション (楽観 / 標準 / 悲観) |
| `get_recommended_actions` | バリューアップ推奨アクション (やる / 待つ / やらない 分類) |
| `build_causal_dag` | 企業価値ドライバーを説明する因果 DAG を生成 |
| `check_compliance` | コンプライアンス Copilot: 規制を踏まえたリスク評価 |

*価格は GA 時に発表します。*

---

## アーキテクチャ

```
┌─────────────────────────────────────────────┐
│         AI エージェント (Claude / GPT 等)    │
└─────────────────────┬───────────────────────┘
                      │ MCP (stdio)
┌─────────────────────▼───────────────────────┐
│   refinancier-mcp (このパッケージ)          │
│   - MCP プロトコルハンドラー                │
│   - API キー認証                            │
│   - ツール定義                              │
└─────────────────────┬───────────────────────┘
                      │ HTTPS (REST)
┌─────────────────────▼───────────────────────┐
│   refinancier-banks.com (バックエンド)      │
│   - 因果推論 AI + XAI                       │
│   - PostgreSQL + Neo4j Aura                 │
│   - Azure OpenAI GPT-5.4                    │
│   - SHA-256 監査証跡                        │
└─────────────────────────────────────────────┘
```

クライアント側ラッパーは意図的に薄く設計されています: MCP のツール呼び出しを refinancier API への HTTPS リクエストに変換するだけです。因果推論・評価・監査証跡などの重い処理はすべてサーバー側 (FISC 準拠のセキュリティ管理下) で実行されます。

姉妹プロダクト [chainanalyzer-mcp](https://www.npmjs.com/package/chainanalyzer-mcp) (`chain-analyzer.com` をバックエンドとするマルチチェーン AML スコアリング) と同じ設計思想を踏襲しています。

---

## ライセンス

MIT。サーバー側のデータと AI モデルは refinancier の知的財産です。

---

## お問い合わせ

- **プロダクト:** [refinancier-banks.com](https://refinancier-banks.com)
- **メール:** info@refinancier.jp
- **姉妹プロダクト:** [chainanalyzer-mcp](https://www.npmjs.com/package/chainanalyzer-mcp)
