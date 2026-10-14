# Directoryz for n8n

Build workflows with the [Directoryz](https://directoryz.app) REST API. This community node sends ordinary HTTP resource requests and returns JSON responses. It does not connect to an MCP server or use JSON-RPC.

## Installation

Install `n8n-nodes-directoryz` from **Settings → Community nodes** in your n8n instance. You can also install the npm package in a self-hosted n8n installation.

## Authentication

Create the **Directoryz OAuth2 API** credential, select **Connect my account**, sign in to Directoryz, and approve the listed permissions. Credentials use dynamic registration, OAuth authorization code flow, PKCE, expiring access tokens, and refresh tokens. The API resource is `https://api.directoryz.app/v1`; REST tokens are separate from MCP tokens.

**Upgrading from 1.x or 2.x:** create a new Directoryz OAuth2 API credential and reconnect it before running workflows. Version 3 uses the product REST resource at `https://api.directoryz.app/v1` with its own OAuth audience. Tokens issued for the earlier resource cannot be reused. Inputs retain their names; review the resource JSON and write confirmations before enabling workflows.

## Resources and operations

Choose a **Resource**, then an **Operation**. Only operations and input fields for that resource are shown. Resources: Account, Directory, Listing.

### Requests

| Operation        | HTTP request                                |
| ---------------- | ------------------------------------------- |
| get_directory    | `GET /v1/directories/:directoryId`          |
| get_profile      | `GET /v1/account`                           |
| list_directories | `GET /v1/directories`                       |
| list_listings    | `GET /v1/directories/:directoryId/listings` |

## Signed lead webhook trigger

The **Directoryz Trigger** creates a lead event subscription when the workflow activates, checks the stored subscription, and deletes only its own subscription when the workflow deactivates. It verifies Directoryz's timestamped HMAC signature against the original body and checks the event ID. A workspace admin role, paid plan, and public HTTPS n8n webhook URL are required.

The REST credential asks for read access plus **webhooks:manage**. Its consent screen explicitly explains that lead contact details can be delivered to your workflow. Existing read-only MCP connections cannot manage webhook subscriptions.

## Workflow behavior

Each input item produces one linked output item with the original response envelope. List operations offer **Return All** or a **Limit** (default 50). The node follows paging tokens internally and combines the result arrays. Single-resource and write operations make one request. Selecting a write operation is sufficient; no extra confirmation checkbox is required. Failed requests stop the workflow unless **Continue On Fail** is enabled. HTTP errors omit credentials and raw request headers.

Requests use the fixed product API origin, encode resource identifiers, and do not follow redirects. Use a dedicated account for automation when you want separate access and data. Account ownership, workspace permissions, billing limits, and entitlement checks are enforced by the product API.

## Development and support

Run `npm ci`, `npm run lint`, and `npm test` to build and validate the package with the n8n node CLI. Source and release automation: [directoryz-app/n8n-nodes-directoryz](https://github.com/directoryz-app/n8n-nodes-directoryz). Report node issues in [GitHub Issues](https://github.com/directoryz-app/n8n-nodes-directoryz/issues).

Product: [Directoryz](https://directoryz.app) · [Privacy](https://directoryz.app/privacy/) · [Agent skill](https://github.com/directoryz-app/agent-skill)

MIT license.

## REST API contract

The request origin and OAuth resource are the product API shown above. GET reads a resource, POST creates or runs the selected action, PATCH updates, and DELETE removes the selected owned resource. The node does not forward requests to a protocol server. Authentication, permissions and ownership are enforced before the API executes an operation.

## Release checks (3.2.0)

Resource and Operation definitions are explicit in the TypeScript node source. This minor update preserves API endpoints, credential types and operation identifiers. Every publication must pass Prettier, the official n8n node CLI linter with zero warnings, the runtime tests, and the n8n community package scanner against both TypeScript source and compiled JavaScript. GitHub Actions runs these checks before publishing with npm provenance.

Run `npm ci --ignore-scripts`, `npm test`, and `npm run review` before proposing a release.

## Pagination contract

List Directories returns the complete workspace set in one response. List Listings follows the API page/limit pagination until the requested limit or last page. Both preserve the API envelope and collect their result arrays.
