#!/usr/bin/env node
/**
 * DROP Notes MCP Server
 * AI가 DROP 노트에 접근할 수 있는 MCP 서버
 *
 * 인증: .mcp.json의 env.SUPABASE_REFRESH_TOKEN으로 전달
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from './server.js'

async function main() {
  const server = createServer()
  const transport = new StdioServerTransport()

  await server.connect(transport)
  console.error('DROP MCP Server started')
}

main().catch((err) => {
  console.error('Server error:', err)
  process.exit(1)
})
