# Demo Script — settings.json
## "What Claude can and cannot do in this repo"

**When:** Part A, 0:33–0:43  
**Purpose:** Show that settings.json controls Claude's autonomy. Without it, Claude interrupts constantly asking permission. With it, Claude works without interruption — within safe boundaries.

---

## Without settings.json — What the Room Sees

Run this prompt with no settings.json in place:

```
Run the architecture tests and tell me if they pass.
```

Claude will pause and ask permission before every action:
- "I need to run `dotnet test` — do you allow this?"
- "I need to read this file — do you allow this?"
- "I need to run `bun install` — do you allow this?"

Say to the room:

> "Claude is cautious by default. Every tool call requires your approval. That is the right default for a tool you just installed. But after five minutes it becomes exhausting — and it defeats the point of an agentic tool."

> "settings.json is how you tell Claude what it is allowed to do autonomously, and what it must never touch."

---

## The File — settings.json

Create this file at `.claude/settings.json` in the repo root.  
Note: `settings.local.json` is machine-local (your personal overrides, git-ignored). `settings.json` is committed and shared with the whole team.

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
  }
}
```

---

## Walk Through Each Section

### `model`
```json
"model": "claude-sonnet-4-5"
```
Pins the model for every Claude Code session in this repo. Everyone on the team uses the same model — no one accidentally runs on Haiku and gets weaker output, or on Opus and burns through budget.

**Without this:** Each developer uses whatever their global default is. Inconsistent results across the team.

### `permissions.allow`
```json
"Bash(dotnet build:*)",
"Bash(dotnet test:*)",
```
Claude can run these commands without asking. The `*` means any arguments.

These are the commands Claude needs to be useful in this repo — build, test, run, migrations, basic git reads, and the React frontend via bun.

**Without this:** Claude asks permission before every single command. Demo this — run the arch test prompt without settings.json and let the room see the interruptions.

### `permissions.deny`
```json
"Bash(git push:*)",
"Bash(dotnet ef database drop:*)",
"WebFetch(*)"
```
Claude can never do these — even if asked directly.

- `git push` — Claude should not push to remote on your behalf. Commits are fine; pushes are a human decision.
- `dotnet ef database drop` — never. A runaway agent dropping the dev database is a bad day.
- `WebFetch` — Claude stays within the codebase. No reaching out to external URLs during a coding session.

**Key point for the room:**

> "Deny rules override allow rules. If something appears in both, deny wins. This is how you draw hard lines around things Claude must never touch — regardless of what you or anyone else asks it to do."

---

## After settings.json — What the Room Sees

Run the same prompt:

```
Run the architecture tests and tell me if they pass.
```

Claude runs `dotnet test Common/Modules.Common.Tests.Architecture` immediately, returns the result, no interruptions.

Say to the room:

> "Same prompt. Claude is now autonomous within the boundaries you defined. It does not ask — it acts. And it cannot cross the lines you drew."

---

## settings.json vs settings.local.json

| | `settings.json` | `settings.local.json` |
|---|---|---|
| Committed to git | Yes | No (git-ignored) |
| Shared with team | Yes | No — machine-local only |
| Use for | Team-wide permissions, model pin | Personal overrides, dev machine specifics |

Tell the room: "Your personal `settings.local.json` overrides `settings.json` locally. If you need a permission just for your machine — add it there, not in the shared file."

---

## Facilitator Notes

- Create `settings.json` live during the walkthrough — do not pre-create it before the session. The room needs to see the before state first.
- The deny list is a conversation starter. Managers in the room will ask "can Claude push?" — the answer is "not in this config, by design."
- If an attendee asks about `WebFetch` — explain that allowing it would let Claude fetch documentation or APIs during a session, which sounds useful but also means Claude can reach outside your codebase. Default to deny; add it explicitly if the team decides to.
