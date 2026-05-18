/**
 * HTTP client for refinancier REST API
 *
 * 🚧 Under Development - server-side public API is in private beta as of 2026-05.
 *
 * Implements per-tool request-body mapping so that the MCP-facing schema (friendly
 * names like `annual_revenue`) can stay stable while the upstream FastAPI schema
 * evolves (e.g. `revenue` / `operating_profit` / `net_income`).
 */

import { TOOLS, ToolDefinition } from "./tools.js";

export interface ClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export class RefinancierClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(opts: ClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.apiKey = opts.apiKey;
  }

  private findTool(name: string): ToolDefinition {
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }
    return tool;
  }

  /**
   * Map the MCP-facing arguments to the upstream FastAPI request body.
   *
   * Tools expose user-friendly parameter names (annual_revenue, annual_profit, etc.)
   * but the FastAPI side uses different field names per endpoint. This isolation
   * layer keeps the MCP schema stable as the backend evolves.
   */
  private mapRequestBody(
    name: string,
    args: Record<string, unknown>
  ): Record<string, unknown> {
    if (name === "get_recommended_actions") {
      // FastAPI QuickAnalysisRequest expects: revenue, operating_profit, net_income, ...
      const annualProfit = args.annual_profit as number | undefined;
      const body: Record<string, unknown> = {
        company_name: args.company_name,
        industry: args.industry,
        revenue: args.annual_revenue,
        operating_profit: args.operating_profit ?? annualProfit,
        net_income: annualProfit,
      };
      // Optional pass-through fields with same name on both sides
      const passThrough = [
        "total_assets",
        "equity",
        "employees",
        "growth_rate",
        "intangible_mode",
        "stock_code",
        "esg_score",
        "human_capital_score",
        "brand_score",
        "technology_score",
        "patents_count",
        "customer_concentration",
        // 2026-05: upstream signals for context-aware recommendation
        "anomaly_findings",
        "risk_warnings",
        "risk_factors",
      ];
      for (const k of passThrough) {
        if (k in args && args[k] !== undefined && args[k] !== null) body[k] = args[k];
      }
      // Renames
      if ("assets" in args && args.assets !== undefined && args.assets !== null) {
        body.total_assets = args.assets;
      }
      return body;
    }

    if (name === "get_anomaly_timeline") {
      // Matches FastAPI AnomalyTimelineQuickRequest 1:1
      return {
        company_name: args.company_name,
        industry: args.industry,
        annual_revenue: args.annual_revenue,
        annual_profit: args.annual_profit,
        years: args.years ?? 3,
        additional_context: args.additional_context,
      };
    }

    if (name === "run_scenario") {
      // Matches FastAPI QuickScenarioRequest 1:1
      return {
        company_name: args.company_name,
        industry: args.industry,
        annual_revenue: args.annual_revenue,
        annual_profit: args.annual_profit,
        scenario: args.scenario,
        additional_context: args.additional_context,
      };
    }

    if (name === "valuate_company") {
      // Matches FastAPI QuickEvaluateRequest 1:1
      return {
        company_name: args.company_name,
        industry: args.industry,
        annual_revenue: args.annual_revenue,
        annual_profit: args.annual_profit,
        total_assets: args.total_assets,
        equity: args.equity,
        employees: args.employees,
        additional_context: args.additional_context,
      };
    }

    if (name === "build_causal_dag") {
      // Matches FastAPI QuickDAGRequest 1:1
      return {
        company_name: args.company_name,
        industry: args.industry,
        annual_revenue: args.annual_revenue,
        annual_profit: args.annual_profit,
        employees: args.employees,
        focus_outcome: args.focus_outcome ?? "enterprise_value",
        additional_context: args.additional_context,
      };
    }

    if (name === "check_compliance") {
      // Matches FastAPI QuickComplianceCheckRequest 1:1
      return {
        text: args.text,
        context: args.context,
      };
    }

    // Default: pass through unchanged
    return args;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.findTool(name);
    const url = `${this.baseUrl}${tool.endpoint}`;
    const body = this.mapRequestBody(name, args);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "refinancier-mcp/0.0.7",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status} from ${tool.endpoint}: ${errorText.slice(0, 500)}`
      );
    }

    return await response.json();
  }
}
