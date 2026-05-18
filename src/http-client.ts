/**
 * HTTP client for refinancier REST API
 *
 * 🚧 Under Development - server-side public API is in private beta as of 2026-05.
 *
 * This client is the thin wrapper that translates MCP tool calls into HTTPS
 * requests against refinancier-banks.com. All authentication, business logic,
 * and audit trail recording happens server-side.
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

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.findTool(name);
    const url = `${this.baseUrl}${tool.endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "refinancier-mcp/0.0.1",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status} from ${url}: ${errorText.slice(0, 500)}`
      );
    }

    return await response.json();
  }
}
