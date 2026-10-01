# Directoryz for n8n

Build workflows with the [Directoryz](https://directoryz.app) REST API. This community node sends ordinary HTTP resource requests and returns JSON responses. It does not connect to an MCP server or use JSON-RPC.

## Installation

Install `n8n-nodes-directoryz` from **Settings → Community nodes** in your n8n instance. You can also install the npm package in a self-hosted n8n installation.

## Authentication

Create the **Directoryz OAuth2 API** credential, select **Connect my account**, sign in to Directoryz, and approve the listed permissions. Credentials use dynamic registration, OAuth authorization code flow, PKCE, expiring access tokens, and refresh tokens. The API resource is `https://mcp.directoryz.app/v1`; REST tokens are separate from MCP tokens.

**Upgrading from 1.x:** reconnect the credential before running workflows. Version 2 replaces the old MCP transport with the native REST API. Inputs retain their names, while outputs are the API's resource JSON. Review existing workflows before enabling writes.

## Operations

| Operation | HTTP request |
| --- | --- |
| get_directory | `GET /v1/directories/:directoryId` |
| get_profile | `GET /v1/account` |
| list_directories | `GET /v1/directories` |
| list_listings | `GET /v1/directories/:directoryId/listings` |

## Signed lead webhook trigger

The **Directoryz Trigger** creates a lead event subscription when the workflow activates, checks the stored subscription, and deletes only its own subscription when the workflow deactivates. It verifies Directoryz's timestamped HMAC signature against the original body and checks the event ID. A workspace admin role, paid plan, and public HTTPS n8n webhook URL are required.

The REST credential asks for read access plus **webhooks:manage**. Its consent screen explicitly explains that lead contact details can be delivered to your workflow. Existing read-only MCP connections cannot manage webhook subscriptions.

## Workflow behavior

Each input item makes one API request and produces one linked output item. Optional pagination fields can be passed through the node's options; list responses retain their next-page cursor or offset. Write operations require the node's explicit confirmation switch. Failed requests stop the workflow unless **Continue On Fail** is enabled. HTTP errors are summarized without including credentials or raw request headers.

Requests use the fixed product API origin, encode resource identifiers, and do not follow redirects. Use a dedicated account for automation when you want separate access and data. Account ownership, workspace permissions, billing limits, and entitlement checks are enforced by the product API.

## Development and support

Run `npm ci`, `npm run lint`, and `npm test` to build and validate the package with the n8n node CLI. Source and release automation: [directoryz-app/n8n-nodes-directoryz](https://github.com/directoryz-app/n8n-nodes-directoryz). Report node issues in [GitHub Issues](https://github.com/directoryz-app/n8n-nodes-directoryz/issues).

Product: [Directoryz](https://directoryz.app) · [Privacy](https://directoryz.app/privacy/) · [Agent skill](https://github.com/directoryz-app/agent-skill) · [MCP integration](https://github.com/directoryz-app/mcp-server)

MIT license.
