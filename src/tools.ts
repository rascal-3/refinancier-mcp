/**
 * Tool definitions for refinancier-mcp
 *
 * Each tool maps to a refinancier REST API endpoint.
 *
 * ⚠️ 現在の状況 (2026-05):
 * - サーバー側 API (anomaly-timeline/quick-get, causal/quick-scenario) は
 *   refinancier-banks のメインリポジトリには存在するが、本番 refinancier-banks.com
 *   にはまだデプロイされていない。
 * - 本番デプロイ完了までは、ローカル開発環境 (FASTAPI/SvelteKit 起動済)
 *   で REFINANCIER_BASE_URL=http://localhost:3000 を指定して動作確認する。
 * - スケルトン版として 3 ツールに絞っている (Decision Intelligence セット)。
 *   本格的なツール一覧は refinancier-banks (Python MCP, 30+ ツール) を参照。
 */

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  endpoint: string;
}

export const TOOLS: ToolDefinition[] = [
  {
    name: "get_recommended_actions",
    description:
      "Investment-committee one-pager: top issues, value drivers, do/wait/dont action classification, " +
      "ROI-ranked strategies. Built on causal AI + value-up suggestion engine. " +
      "Supports 3 intangible-asset modes: default / user_input / ai_research (Bing grounding).",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        industry: { type: "string" },
        annual_revenue: { type: "number", description: "Annual revenue (JPY)" },
        annual_profit: {
          type: "number",
          description: "Annual net income (JPY, can be negative)",
        },
        operating_profit: {
          type: "number",
          description: "Operating profit (JPY, optional; defaults to annual_profit)",
        },
        assets: { type: "number", default: 0 },
        equity: { type: "number", default: 0 },
        employees: { type: "integer", default: 0 },
        growth_rate: { type: "number", default: 0 },
        intangible_mode: {
          type: "string",
          enum: ["default", "user_input", "ai_research"],
          default: "default",
        },
        stock_code: { type: "string", description: "For ai_research mode precision" },
        esg_score: { type: "number", minimum: 0, maximum: 1 },
        human_capital_score: { type: "number", minimum: 0, maximum: 1 },
        brand_score: { type: "number", minimum: 0, maximum: 1 },
        technology_score: { type: "number", minimum: 0, maximum: 1 },
        patents_count: { type: "integer", minimum: 0 },
        max_strategies: { type: "integer", default: 5, minimum: 1, maximum: 10 },
      },
      required: ["company_name", "industry", "annual_revenue", "annual_profit"],
    },
    endpoint: "/api/v1/value-up/quick-analyze",
  },

  {
    name: "get_anomaly_timeline",
    description:
      "Detect anomalies over time across 4 categories: Financial (working-capital, profit-vs-CF, margins), " +
      "Governance (board/auditor/major-customer changes), Execution (plan-vs-actual), Strategic (M&A, capex skew). " +
      "LLM-based lightweight version (no DB dependency).",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        industry: { type: "string" },
        annual_revenue: { type: "number" },
        annual_profit: { type: "number" },
        years: { type: "integer", minimum: 1, maximum: 10, default: 3 },
        additional_context: {
          type: "string",
          description: "Additional context (e.g. 'CEO changed in 2024, lost major customer A')",
        },
      },
      required: ["company_name", "industry"],
    },
    endpoint: "/api/v1/anomaly-timeline/quick-get",
  },

  {
    name: "run_scenario",
    description:
      "What-if scenario simulation (lightweight LLM-based version). " +
      "Returns optimistic/base/pessimistic enterprise value, expected EV delta, downside risk, " +
      "key drivers and risk factors.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        industry: { type: "string" },
        annual_revenue: { type: "number" },
        annual_profit: { type: "number" },
        scenario: {
          type: "string",
          description: "Natural-language scenario (e.g. 'new CEO + 1B JPY capex')",
        },
        additional_context: { type: "string" },
      },
      required: ["company_name", "industry", "scenario"],
    },
    endpoint: "/api/causal/quick-scenario",
  },
];
