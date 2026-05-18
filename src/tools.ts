/**
 * Tool definitions for refinancier-mcp
 *
 * Each tool maps to a refinancier REST API endpoint.
 *
 * 現在の状況 (2026-05, v0.0.6):
 * - 6 ツール公開:
 *   - get_recommended_actions / get_anomaly_timeline / run_scenario (Decision Intel)
 *   - valuate_company / build_causal_dag / check_compliance (Valuation / Causal / Compliance)
 * - サーバー側はすべて quick-* エンドポイント (LLM ベース簡易版、認証なし、5/21 デモ向け)
 * - 本格的な機能セット (30+ ツール、認証つき) は refinancier-banks の Python MCP を参照
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

  {
    name: "valuate_company",
    description:
      "Lightweight enterprise valuation (LLM-based, no LangGraph). " +
      "Returns a valuation range (low/median/high) using industry PER anchors as priors. " +
      "\n\n[Output Schema]:" +
      "\n- enterprise_value: median estimated value (JPY)" +
      "\n- valuation_low / valuation_high: estimated range (JPY)" +
      "\n- valuation_method: per / psr / dcf / hybrid" +
      "\n- confidence: 0-1 (lower when inputs are sparse)" +
      "\n- key_drivers: value drivers (List[str], 3-5)" +
      "\n- financial_strengths / financial_weaknesses: List[str], 2-4 each" +
      "\n- reasoning: explanation of how the range was derived",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        industry: { type: "string" },
        annual_revenue: { type: "number", description: "Annual revenue (JPY)" },
        annual_profit: { type: "number", description: "Annual net income (JPY, optional)" },
        total_assets: { type: "number", description: "Total assets (JPY, optional)" },
        equity: { type: "number", description: "Equity (JPY, optional)" },
        employees: { type: "integer", description: "Employee count (optional)" },
        additional_context: { type: "string" },
      },
      required: ["company_name", "industry", "annual_revenue"],
    },
    endpoint: "/api/v1/evaluations/quick-evaluate",
  },

  {
    name: "build_causal_dag",
    description:
      "Build a causal DAG (directed acyclic graph) for a company's key outcome variable. " +
      "LLM-based lightweight version (no causal_service dependency). " +
      "Nodes are typed (driver / mediator / outcome / risk), edges carry polarity and strength." +
      "\n\n[Output Schema]:" +
      "\n- nodes: List[{id, label, type, description}]" +
      "\n- edges: List[{source, target, polarity, strength (0-1), rationale}]" +
      "\n- summary: overall causal-structure summary" +
      "\n- key_insights: List[str], 3-5 strategic insights" +
      "\n- suggested_interventions: List[str], 3-5 leverage points",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        industry: { type: "string" },
        annual_revenue: { type: "number" },
        annual_profit: { type: "number" },
        employees: { type: "integer" },
        focus_outcome: {
          type: "string",
          description: "Target outcome variable (enterprise_value / revenue_growth / operating_margin / ...)",
          default: "enterprise_value",
        },
        additional_context: { type: "string" },
      },
      required: ["company_name", "industry"],
    },
    endpoint: "/api/causal/quick-dag",
  },

  {
    name: "check_compliance",
    description:
      "Lightweight compliance check (LLM-based, no Neo4j / webhook side-effects). " +
      "Detects risks against Japanese financial regulations (Banking Act, FIEA, APPI, AML, etc.)." +
      "\n\n[Output Schema]:" +
      "\n- is_compliant: bool" +
      "\n- risk_score: 0-100" +
      "\n- risk_level: low / medium / high" +
      "\n- issues: List[{severity, regulation_name, issue_description, suggestion, location}]" +
      "\n- summary: overall assessment" +
      "\n- checked_regulations: List[str]",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Target text (email, chat, document, minutes, etc.)",
        },
        context: {
          type: "string",
          description: "Optional context (business situation, counterparty attributes, etc.)",
        },
      },
      required: ["text"],
    },
    endpoint: "/api/v1/compliance/quick-check",
  },
];
