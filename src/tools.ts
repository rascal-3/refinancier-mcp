/**
 * Tool definitions for refinancier-mcp
 *
 * Each tool maps to a refinancier REST API endpoint. The server-side endpoints
 * (currently private, see refinancier-banks.com) will be exposed publicly with
 * API key authentication at GA.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  endpoint: string; // POST path under the base URL
}

export const TOOLS: ToolDefinition[] = [
  {
    name: "valuate_company",
    description:
      "Multi-method enterprise valuation (PER, PSR, DCF, asset-based) with intangible-asset premium. " +
      "100% reproducible (deterministic compute), XAI audit-trail attached. " +
      "Output: enterprise value (pessimistic/base/optimistic), confidence score, reasoning, risk factors.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string", description: "Company name" },
        industry: { type: "string", description: "Industry (e.g. 製造業, Manufacturing)" },
        annual_revenue: { type: "number", description: "Annual revenue (JPY)" },
        annual_profit: { type: "number", description: "Annual net income (JPY, can be negative)" },
      },
      required: ["company_name", "industry", "annual_revenue", "annual_profit"],
    },
    endpoint: "/api/v1/evaluations/quick-evaluate",
  },

  {
    name: "get_anomaly_timeline",
    description:
      "Detect anomalies over time across 4 categories: Financial (working-capital, profit-vs-CF, margins), " +
      "Governance (board/auditor/major-customer changes), Execution (plan-vs-actual), Strategic (M&A, capex skew). " +
      "Fuses 10-year financials + EDINET + TDB + news into one timeline with evidence.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        years: { type: "integer", minimum: 1, maximum: 10, default: 3 },
      },
      required: ["company_name"],
    },
    endpoint: "/api/v1/anomaly/timeline",
  },

  {
    name: "run_scenario",
    description:
      "What-if scenario simulation using Do-calculus counterfactual reasoning. " +
      "Returns optimistic/base/pessimistic enterprise value, expected EV delta, downside risk. " +
      "Use for strategic decisions (M&A, capex, leadership changes).",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        scenario: {
          type: "string",
          description: "Natural-language scenario (e.g. 'new CEO + 1B JPY capex')",
        },
      },
      required: ["company_name", "scenario"],
    },
    endpoint: "/api/v1/scenarios/simulate",
  },

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
        annual_revenue: { type: "number" },
        annual_profit: { type: "number" },
        intangible_mode: {
          type: "string",
          enum: ["default", "user_input", "ai_research"],
          default: "default",
        },
        stock_code: { type: "string", description: "For ai_research mode precision" },
      },
      required: ["company_name", "industry", "annual_revenue", "annual_profit"],
    },
    endpoint: "/api/v1/value-up/quick-analyze",
  },

  {
    name: "build_causal_dag",
    description:
      "Generate a causal DAG explaining enterprise value drivers using LLM-assisted causal-graph synthesis. " +
      "Output: nodes (factors), edges (causal links), confidence scores, narrative explanation.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        target_metric: {
          type: "string",
          description: "What to explain (e.g. 'enterprise value', 'profit margin')",
        },
      },
      required: ["company_name"],
    },
    endpoint: "/api/v1/causal/dag",
  },

  {
    name: "check_compliance",
    description:
      "Compliance Copilot: regulation-aware risk assessment with semantic search over the Neo4j " +
      "regulation knowledge graph. Returns applicable regulations, risk level, mitigations.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text or document to check" },
        regulation_domain: {
          type: "string",
          description: "e.g. AML, GDPR, FISC, 金商法",
        },
      },
      required: ["text"],
    },
    endpoint: "/api/v1/compliance/check",
  },
];
