# Part C Facilitator Guide
## Apply to your own project (1:35–2:00, 25 min)

**Goal:** Every attendee leaves with a working CLAUDE.md committed on their own real project, plus one Monday-morning win configured and ready to use.

---

## 1:35 — Switch context (2 min)

Say to the room:

> "We've spent the last 90 minutes on the shared repo. Now we switch. Open your own work repo in a new terminal. This is the one you actually ship."

Give everyone 60 seconds to open their repo. While they do:
- Walk the room — check that everyone has a terminal open in their own project
- If someone doesn't have their repo cloned: they missed the pre-flight step. Have them clone it now while others start. Don't stop the room for one person.

---

## 1:37 — Write your own CLAUDE.md (13 min)

Say to the room:

> "Open the starter template. It's in `templates/CLAUDE.md.starter.md` in the learn-ai repo. Copy it into the root of your own project as `CLAUDE.md`. Then fill it in."

Direct them to open `templates/CLAUDE.md.starter.md` from the learn-ai repo and copy it to their own project root.

**While they fill it in — walk the room. Ask each person:**

| Question | Why it matters |
|---|---|
| "What does your app do in one sentence?" | Helps them write the opening section |
| "How do you build and run it locally?" | The most important section — Claude needs exact commands |
| "What's the folder structure?" | Helps Claude navigate without guessing |
| "What are the non-obvious conventions?" | This is the high-value section — push them here |
| "What patterns do you use that Claude might guess wrong?" | Same as the ArchiveShipment demo — what would fail without context? |

**The non-obvious conventions section is where most value is.** Help each attendee think of at least two things Claude would get wrong without being told — naming patterns, return types, cross-module rules, frontend package manager, anything specific to their codebase.

**After 10 minutes**, ask 1–2 volunteers to show what they wrote for conventions. Read it aloud. Ask the room: "Is this enough for Claude to get it right?" Usually the answer is no — use that to push for more specificity.

**At 12 minutes**, have everyone commit:

```
git add CLAUDE.md
git commit -m "add project context for Claude Code"
```

---

## 1:50 — Pick one Monday-morning win (7 min)

Say to the room:

> "Pick one. Do not try both — you won't finish either. The goal is to leave with one thing configured and working on your real project."

**Option A — Adapt the scaffold skill**

For developers who have a repeating pattern in their codebase (a feature structure, a module pattern, a component template):

> "Open `.claude/skills/scaffold-backend.md` from the learn-ai repo. Copy it into your own project at `.claude/skills/`. Change the namespace pattern, the file naming, and the code template to match your codebase. Commit it."

Walk them through changing:
- The namespace pattern to match their project
- The file names to match their conventions
- The handler/endpoint pattern to match their architecture

**Option B — Install the pre-commit hook**

For developers who want an immediate guardrail without customisation:

> "Run the hook setup command from the instructor guide. Swap out `Common/Modules.Common.Tests.Architecture` for whichever test project makes sense in your repo — could be an architecture test, a linting check, or a build check."

```powershell
@'
#!/bin/sh
echo "Running checks..."
dotnet test <YourTestProject> --no-build --verbosity quiet
if [ $? -ne 0 ]; then
  echo "COMMIT BLOCKED: checks failed."
  exit 1
fi
echo "Checks passed."
'@ | Set-Content -Path ".git\hooks\pre-commit" -Encoding utf8 -NoNewline
```

If they don't have an architecture test project, use `dotnet build` as the check — better than nothing.

---

## 1:57 — Takeaway card + close (3 min)

Hand out or share the takeaway card (see `_instructor/takeaway-card.md` — to be printed or shared as PDF).

Say to the room:

> "You now have CLAUDE.md on your real project. That is the foundation. Everything else — Auto Memory, skills, MCP, hooks — builds on top of it."

> "Monday morning: open your project, start Claude Code, and run one real task. See what it does now versus what it would have done before today."

> "The shift from prompt engineering to context engineering is not a one-time event. Every time you add a convention to CLAUDE.md, every time Claude writes an Auto Memory entry, every skill you commit — the baseline gets higher. It compounds."

Close the session.

---

## Facilitator Notes

- **Do not let attendees work on both options.** 7 minutes is not enough for two things. Be firm: pick one, finish it, commit it.
- **The commit is the deliverable.** If they haven't committed by 1:57, help them commit whatever they have — even a partial CLAUDE.md is better than nothing on their machine.
- **Common blocker — "my project is too complex to describe."** Push back gently: "Start with build commands and folder structure. That alone gives Claude a better baseline than nothing." Perfect is the enemy of committed.
- **Common blocker — "I don't know what conventions to write."** Ask: "What's the last thing you had to correct Claude on?" Whatever that was — write it down.
- **If someone finishes early** — have them test their CLAUDE.md. Ask Claude: "Add a new [whatever their main pattern is]." Does it get it right? If not, what's missing from CLAUDE.md?
