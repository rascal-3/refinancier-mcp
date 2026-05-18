#!/usr/bin/env node
/**
 * refinancier-mcp - MCP client for refinancier
 *
 * 🚧 Under Development - Q3 2026 GA予定
 *
 * This is the skeleton implementation. Tools currently return a "Coming Soon"
 * placeholder. Full implementation will route MCP tool calls to refinancier
 * REST APIs (currently in development, see refinancier-banks.com).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { TOOLS } from "./tools.js";
import { RefinancierClient } from "./http-client.js";

const API_KEY = process.env.REFINANCIER_API_KEY;
const BASE_URL =
  process.env.REFINANCIER_BASE_URL || "https://refinancier-banks.com";

const client = new RefinancierClient({ baseUrl: BASE_URL, apiKey: API_KEY });

const server = new Server(
  {
    name: "refinancier-mcp",
    version: "0.0.4",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Skeleton: return placeholder until server-side public API is ready
  if (!API_KEY) {
    return {
      content: [
        {
          type: "text",
          text:
            "🚧 refinancier-mcp is under development (Q3 2026 GA).\n\n" +
            "To enable, set REFINANCIER_API_KEY env var with your key from refinancier-banks.com.\n" +
            "Contact info@refinancier.jp for early access.",
        },
      ],
    };
  }

  try {
    const result = await client.callTool(name, args ?? {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [
        { type: "text", text: `❌ Tool call failed: ${message}` },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("refinancier-mcp v0.0.4 (skeleton) running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
