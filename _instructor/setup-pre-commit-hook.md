# Pre-commit Hook — Architecture Tests
## "Nothing that breaks the module boundaries reaches the repo"

**When:** Part B, 1:24–1:31  
**Purpose:** Show that Claude Code hooks can enforce architecture rules automatically on every commit — no human review needed for this class of violation.

---

## What the Hook Does

Runs `dotnet test Common/Modules.Common.Tests.Architecture` before every commit. If any module references another module directly (bypassing PublicApi), the tests fail and the commit is blocked.

The architecture tests already exist and already catch these violations. The hook activates them as a guardrail — turning a test you have to remember to run into one that runs itself.

---

## Setup — Run Once Per Developer Machine

From the repo root (`learn-ai/`), run:

```bash
# Create the hooks directory if it doesn't exist
mkdir -p .git/hooks

# Write the pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "Running architecture tests..."
dotnet test Common/Modules.Common.Tests.Architecture --no-build --verbosity quiet
if [ $? -ne 0 ]; then
  echo ""
  echo "COMMIT BLOCKED: Architecture tests failed."
  echo "A module is referencing another module directly instead of through PublicApi."
  echo "Fix the violation before committing."
  exit 1
fi
echo "Architecture tests passed."
EOF

# Make it executable
chmod +x .git/hooks/pre-commit
```

On Windows (PowerShell), run this instead:

```powershell
# Create hooks directory
New-Item -ItemType Directory -Force -Path ".git\hooks" | Out-Null

# Write the hook file
@'
#!/bin/sh
echo "Running architecture tests..."
dotnet test Common/Modules.Common.Tests.Architecture --no-build --verbosity quiet
if [ $? -ne 0 ]; then
  echo ""
  echo "COMMIT BLOCKED: Architecture tests failed."
  echo "A module is referencing another module directly instead of through PublicApi."
  echo "Fix the violation before committing."
  exit 1
fi
echo "Architecture tests passed."
'@ | Set-Content -Path ".git\hooks\pre-commit" -Encoding utf8 -NoNewline
```

> **Note:** Git hooks live in `.git/hooks/` which is not committed to the repo. Every developer runs this setup once on their own machine. This is intentional — hooks are per-developer, like Auto Memory.

---

## Demo Script

### Step 1 — Install the hook (1 min)

Run the setup command above live. Show the file was created:

```
cat .git/hooks/pre-commit
```

### Step 2 — Create a bad commit (3 min)

Open `Modules/Shipments/Modules.Shipments.Features/Features/CreateShipment/CreateShipment.Handler.cs` and add this using statement at the top:

```csharp
using Modules.Stocks.Infrastructure.Database;  // direct reference — arch violation
```

Save the file. Now try to commit:

```
git add Modules/Shipments/Modules.Shipments.Features/Features/CreateShipment/CreateShipment.Handler.cs
git commit -m "test: demo arch violation"
```

The hook fires. The room sees:

```
Running architecture tests...
COMMIT BLOCKED: Architecture tests failed.
A module is referencing another module directly instead of through PublicApi.
Fix the violation before committing.
```

Say to the room:

> "The hook caught it. Claude did not need to catch it. You did not need to catch it in code review. The guardrail ran itself."

### Step 3 — Fix and recommit (1 min)

Remove the bad using statement. Commit again:

```
git add Modules/Shipments/Modules.Shipments.Features/Features/CreateShipment/CreateShipment.Handler.cs
git commit -m "test: clean commit after fixing arch violation"
```

The hook fires again, tests pass:

```
Running architecture tests...
Architecture tests passed.
[training abc1234] test: clean commit after fixing arch violation
```

Say to the room:

> "Same hook, clean code — commit goes through. The boundary holds."

---

## Facilitator Notes

- Run `dotnet build ModularMonolithTemplate.sln` before this demo — the hook uses `--no-build` which means the assemblies must already exist. If the build hasn't run, the tests will fail for the wrong reason.
- Revert the bad using statement after the demo before moving on. Do not leave a failing file in the working tree.
- If an attendee asks "can we skip the hook?" — yes, with `git commit --no-verify`. That is by design. Hooks are advisory guardrails, not hard enforcement. The honest answer is: "You can bypass it, but then you own the violation."
- The `--no-build` flag is important — without it the hook would recompile the entire solution on every commit, which is too slow. The build step is the developer's responsibility before committing.
