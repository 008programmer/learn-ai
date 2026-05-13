# Demo Script — MCP Postgres
## "Claude queries the live database"

**When:** Part B, 1:10–1:24 (14 min)  
**Purpose:** Show that Claude can call real tools — not just read files. MCP connects Claude to the live Aspire-orchestrated database and lets it query real schema and real data during a coding session.

---

## Prerequisites

- Docker Desktop running
- Aspire running: `dotnet run --project ModularMonolithTemplate.AppHost`
- Wait ~30 seconds for Postgres to be ready (Aspire dashboard shows green)
- `@modelcontextprotocol/server-postgres` installed globally:

```
bun install -g @modelcontextprotocol/server-postgres
```

Verify install:
```
bunx @modelcontextprotocol/server-postgres --help
```

---

## Step 1 — Find the Aspire Postgres connection string (2 min)

Aspire manages the Postgres instance and assigns a dynamic port on startup. Get the connection string from the Aspire dashboard:

1. Open the Aspire dashboard — http://localhost:15888 (default)
2. Click on the `Postgres` resource
3. Copy the connection string — it looks like:

```
Host=localhost;Port=<dynamic-port>;Database=postgres;Username=postgres;Password=<generated-password>
```

Convert to postgres URL format for MCP:
```
postgresql://postgres:<password>@localhost:<port>/postgres
```

> **Instructor tip:** Write this URL on the board or paste it in the shared chat before the demo. Attendees should not have to figure out the port themselves mid-session.

---

## Step 2 — Add MCP postgres server to Claude Code (3 min)

In the repo root, open or create `.claude/settings.json` and add the MCP server:

```json
{
  "model": "claude-sonnet-4-5",
  "permissions": {
    "allow": [
      "Bash(dotnet build:*)",
      "Bash(dotnet test:*)",
      "Bash(dotnet run:*)",
      "Bash(dotnet ef:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(bun install:*)",
      "Bash(bun run:*)"
    ],
    "deny": [
      "Bash(git push:*)",
      "Bash(dotnet ef database drop:*)",
      "WebFetch(*)"
    ]
  },
  "mcpServers": {
    "postgres": {
      "command": "bunx",
      "args": [
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:<password>@localhost:<port>/postgres"
      ]
    }
  }
}
```

Replace `<password>` and `<port>` with the values from the Aspire dashboard.

Restart Claude Code to pick up the new MCP config:
```
exit
claude
```

---

## Step 3 — Verify MCP is connected (1 min)

In Claude Code, type:

```
What MCP tools do you have available?
```

Claude should list the postgres MCP tools — `query`, `list_tables`, `describe_table` etc.

If Claude does not list them — the MCP server failed to start. Check:
- Is `bunx @modelcontextprotocol/server-postgres` reachable? (`bunx @modelcontextprotocol/server-postgres --help`)
- Is the connection string correct?
- Is Aspire running and Postgres healthy?

---

## Step 4 — Live Demo Queries (8 min)

### Query 1 — List all schemas (show module isolation)

Ask Claude:
```
List all schemas in the database.
```

Claude calls the MCP tool. Expected result:
```
shipments
carriers
stocks
users
public
```

Say to the room:

> "Each module owns its own schema. This is the database boundary matching the code boundary. Shipments data is in the shipments schema — Stocks data is in the stocks schema. They cannot join across schemas without going through the API."

### Query 2 — Inspect the shipments schema

Ask Claude:
```
Show me all tables in the shipments schema with their columns.
```

Claude queries `information_schema.columns`. The room sees real column names, real types — `shipment_number`, `status`, `order_id`, `created_at` etc.

Say to the room:

> "Claude is not guessing. It can see the actual schema. When it generates code against this database, it knows the exact column names and types. No hallucinated field names."

### Query 3 — Query live data

Ask Claude:
```
Show me the 5 most recent shipments from the shipments schema.
```

Claude runs:
```sql
SELECT * FROM shipments.shipment ORDER BY created_at DESC LIMIT 5;
```

The room sees real rows from the seeded data.

Say to the room:

> "This is the same data the application is serving. Claude can now query it, inspect it, and use it to make better decisions about the code it generates."

### Query 4 — Tie it back to the scaffold skill

Ask Claude:
```
I want to add a new feature called ArchiveShipment. 
Check if a table called archive_shipment already exists in the shipments schema,
and tell me what the last applied migration is for this module.
```

Claude runs both queries from the scaffold-backend skill pre-flight check. This is the MCP demo landing directly on the skill we built earlier.

Say to the room:

> "This is exactly what the scaffold-backend subagent does automatically when you run /scaffold-feature. The MCP check is not a demo toy — it is production behaviour built into the skill."

---

## Without MCP — What Claude says

Run this without MCP connected:

```
What tables exist in the shipments schema?
```

Claude responds: "I don't have access to the database. I can only infer the schema from the code."

With MCP:

```
What tables exist in the shipments schema?
```

Claude queries the live DB and returns the actual tables.

Say to the room:

> "MCP turns Claude from a code reader into a developer with database access. It is the difference between guessing and knowing."

---

## Facilitator Notes

- The Aspire dynamic port changes every restart. Write the connection string on the board at the start of the day and keep Aspire running for the entire workshop.
- The MCP server is read-only by default — Claude cannot INSERT, UPDATE, or DELETE. This is intentional and worth saying: "Claude can look. It cannot touch."
- If Aspire is not running or Postgres is not healthy, skip the live data query (Query 3) and stick to schema inspection (Queries 1 and 2) using a fallback Docker Compose setup.
- Fallback: `docker-compose -f docker-compose.yml up -d` starts Postgres on a fixed port defined in `docker-compose.yml`. Use that connection string instead of the Aspire one.
