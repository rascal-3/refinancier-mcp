# refinancier-mcp

> **MCP client for refinancier — Trust Infrastructure for Uncertain Assets**
> Decision-grade enterprise valuation, causal inference, and value-up recommendations for AI agents.

[![Status](https://img.shields.io/badge/status-Under%20Development-orange)](#)
[![MCP](https://img.shields.io/badge/MCP-1.x-blue)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🚧 Under Development

This package is the **client-side MCP wrapper** for [refinancier-banks](https://refinancier-banks.com).
It exposes refinancier's decision-intelligence APIs (enterprise valuation, anomaly detection,
value-up recommendations, causal inference, XAI audit trails) to AI agents via the
[Model Context Protocol](https://modelcontextprotocol.io/).

**Current status:** Skeleton repository. Coming Q3 2026 for self-serve usage.

For early access, see [refinancier-banks.com](https://refinancier-banks.com) or contact info@refinancier.jp.

---

## Why refinancier-mcp?

| Capability | What it does |
|------------|--------------|
| **Enterprise valuation** | Multi-method (PER/PSR/DCF/Asset) + intangible asset premium + 100% reproducible |
| **Anomaly timeline** | 10-year financial + EDINET + TDB + news fused into one timeline (4 anomaly types) |
| **Scenario simulation** | What-if + counterfactual reasoning via Do-calculus |
| **Value-up recommendations** | Investment committee one-pager: top issues, value drivers, do/wait/dont actions |
| **XAI audit trail** | SHA-256 hash chain + Neo4j; AI decisions are fully replayable and tamper-proof |

Designed for **Japanese regional banks, M&A intermediaries, PE funds, and strategy departments**
of operating companies — anywhere uncertainty must be translated into auditable decisions.

---

## Quick Start

### Claude Desktop / Claude Code

Add to your MCP configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

The `-y` flag auto-installs devDependencies (including `tsx`) needed at runtime.

### From Source

```bash
git clone https://github.com/rascal-3/refinancier-mcp.git
cd refinancier-mcp
npm install
npm start
```

### API Keys

API keys (`rfn_live_*`) are issued via the refinancier admin console (currently private beta).
Contact info@refinancier.jp for early access.

---

## Tools (planned)

| Tool | Description |
|------|-------------|
| `valuate_company` | Multi-method enterprise valuation with reproducibility guarantee |
| `get_anomaly_timeline` | Detect financial / governance / execution / strategic anomalies over time |
| `run_scenario` | What-if scenario simulation (optimistic / base / pessimistic) |
| `get_recommended_actions` | Value-up recommendations with do / wait / dont classification |
| `build_causal_dag` | Generate causal DAG explaining enterprise value drivers |
| `check_compliance` | Compliance Copilot: regulation-aware risk assessment |

*Pricing announced at GA.*

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         AI Agent (Claude / GPT / ...)       │
└─────────────────────┬───────────────────────┘
                      │ MCP (stdio)
┌─────────────────────▼───────────────────────┐
│   refinancier-mcp (this package)            │
│   - MCP protocol handler                    │
│   - API key auth                            │
│   - Tool definitions                        │
└─────────────────────┬───────────────────────┘
                      │ HTTPS (REST)
┌─────────────────────▼───────────────────────┐
│   refinancier-banks.com (backend)           │
│   - Causal AI + XAI                         │
│   - PostgreSQL + Neo4j Aura                 │
│   - Azure OpenAI GPT-5.4                    │
│   - SHA-256 audit trail                     │
└─────────────────────────────────────────────┘
```

The client-side wrapper is intentionally thin: it translates MCP tool calls into HTTPS
requests against the refinancier API. All heavy lifting (causal inference, evaluation,
audit trail) happens server-side, behind FISC-compliant security controls.

This mirrors the design of our sibling product
[chainanalyzer-mcp](https://www.npmjs.com/package/chainanalyzer-mcp), which exposes
multi-chain AML scoring as MCP tools backed by `chain-analyzer.com`.

---

## License

MIT. Server-side data and AI models are proprietary to refinancier.

---

## Contact

- **Product:** [refinancier-banks.com](https://refinancier-banks.com)
- **Email:** info@refinancier.jp
- **Sibling product:** [chainanalyzer-mcp](https://www.npmjs.com/package/chainanalyzer-mcp)
