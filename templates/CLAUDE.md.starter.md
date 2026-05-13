# CLAUDE.md — Starter Template
## Fill this in for your own project during Part C

Replace every line that starts with `→` with your project's actual information.
Delete the `→` prompts once you've filled them in.
Commit this file to the root of your repo when done.

---

# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this project is

→ One or two sentences. What does this application do? Who uses it?
→ Example: "A logistics management system for tracking shipments and inventory. Used internally by operations teams."

## Stack

→ List your main technologies. Example:
- .NET 10, ASP.NET Core
- Angular 19 / React 19 (delete whichever doesn't apply)
- PostgreSQL / SQL Server / other
- Docker Compose / .NET Aspire for local dev

## How to build and run

```bash
→ Paste the exact commands to build and run your project locally.
→ Example:
dotnet build YourSolution.sln
dotnet run --project YourHost.Project
```

## How to run tests

```bash
→ Paste the exact commands to run your tests.
→ Example:
dotnet test YourSolution.sln
dotnet test YourProject.Tests.Unit
```

## Project structure

→ List your main folders and what they contain. Example:
- `YourHost/` — ASP.NET Core host, wires all modules
- `Modules/` — business modules (list them)
- `Common/` — shared infrastructure
- `ClientApp/` — frontend (React / Angular)

## Architecture

→ Describe how your codebase is organised. Answer these questions:
→ - Is it modular monolith, microservices, layered, vertical slice, or other?
→ - How are features structured inside a module? (e.g. one folder per use case)
→ - What are the naming conventions for files? (e.g. Feature.Handler.cs, Feature.Endpoint.cs)
→ - Are there any cross-cutting patterns Claude must follow? (e.g. Result pattern, no exceptions)

## Conventions Claude must follow

→ List the non-obvious rules. These are the things that make the before/after demo work.
→ Examples:
- Always return `Result<T>` — never throw business exceptions
- Use `bun` not `npm` for the frontend
- Namespaces follow the folder structure exactly
- Every handler has a matching interface `I{Name}Handler : IHandler`
- Cross-module calls go through PublicApi interfaces only — never reference another module's internals

## Database

→ What database? What ORM? Any naming conventions?
→ Example: PostgreSQL with EF Core, snake_case column names, per-module schemas

## Testing approach

→ What do you use for unit tests? Integration tests? Any test patterns Claude should follow?
→ Example: NSubstitute for mocking, Testcontainers for integration tests, WebApplicationFactory for API tests

## Frontend conventions

→ If you have a frontend, what patterns should Claude follow?
→ Example: Zustand for state, Zod for validation, shadcn/ui for components, always use bun not npm
