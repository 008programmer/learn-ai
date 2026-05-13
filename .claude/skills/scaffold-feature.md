# Skill: scaffold-feature
## Orchestrator — Full Stack Feature Scaffold

**Usage:** `/scaffold-feature <ModuleName> <FeatureName>`  
**Example:** `/scaffold-feature Shipments ArchiveShipment`

---

## What This Skill Does

Scaffolds a complete full-stack feature across backend, Angular, and React by spawning three specialist subagents in parallel. Each subagent uses its own skill. The backend subagent uses MCP to run pre- and post-checks against the live database before generating any code.

---

## Instructions

You are the orchestrator. When this skill is invoked:

### Step 1 — Parse input
Extract:
- `ModuleName` — e.g. `Shipments`
- `FeatureName` — e.g. `ArchiveShipment`
- `moduleName` — camelCase version, e.g. `shipments`
- `featureName` — camelCase version, e.g. `archiveShipment`
- `SchemaName` — lowercase module name used as postgres schema, e.g. `shipments`

### Step 2 — Announce the plan
Tell the user:

> "Scaffolding **{FeatureName}** across the full stack. Spawning three subagents in parallel:
> - Backend → scaffold-backend skill + MCP pre/post checks
> - Angular → scaffold-angular skill
> - React → scaffold-react skill"

### Step 3 — Spawn three subagents in parallel

Spawn all three at the same time. Do not wait for one to finish before starting the next.

**Subagent 1 — Backend**
> Use the scaffold-backend skill. Module: {ModuleName}. Feature: {FeatureName}. Schema: {SchemaName}. Before generating any code, use the MCP postgres tool to run the pre-flight checks defined in that skill. After generating code, run the post-flight migration check.

**Subagent 2 — Angular**
> Use the scaffold-angular skill. Module: {ModuleName}. Feature: {FeatureName}. Place files in Client.Angular/src/app/pages/{moduleName}/.

**Subagent 3 — React**
> Use the scaffold-react skill. Module: {ModuleName}. Feature: {FeatureName}. Place files in Client.React/src/pages/{moduleName}/ and Client.React/src/.

### Step 4 — Collect and report results

When all three subagents complete, report:

```
✓ Backend
  - Modules/{ModuleName}/Modules.{ModuleName}.Features/Features/{FeatureName}/{FeatureName}.Endpoint.cs
  - Modules/{ModuleName}/Modules.{ModuleName}.Features/Features/{FeatureName}/{FeatureName}.Handler.cs
  - Modules/{ModuleName}/Modules.{ModuleName}.Features/Features/{FeatureName}/{FeatureName}.Validators.cs
  - Modules/{ModuleName}/Modules.{ModuleName}.Tests.Unit/Features/{FeatureName}/{FeatureName}HandlerTests.cs
  - MCP pre-check: [result]
  - MCP post-check: [result]

✓ Angular
  - Client.Angular/src/app/pages/{moduleName}/{featureName}/{featureName}.component.ts
  - Client.Angular/src/app/pages/{moduleName}/{featureName}/{featureName}.component.spec.ts

✓ React
  - Client.React/src/pages/{moduleName}/{FeatureName}Page.tsx
  - Client.React/src/api/{moduleName}.ts (updated)
  - Client.React/src/stores/{moduleName}.store.ts (updated)

Next steps:
1. Register the new route in Client.React/src/router.tsx
2. Register the new route in Client.Angular/src/app/app.routes.ts
3. Run: dotnet build ModularMonolithTemplate.sln
4. Run: dotnet test Common/Modules.Common.Tests.Architecture
```

If any subagent fails, report which one and why. The other outputs are still valid.
