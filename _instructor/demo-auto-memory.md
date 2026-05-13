# Demo Script — Auto Memory
## "Claude writes its own notes"

**When:** Part B opener, 0:50–0:55 (5 minutes — show it, name it, move on)  
**Purpose:** Show that Claude can accumulate knowledge on its own, separate from CLAUDE.md. Name the distinction clearly: CLAUDE.md is team-shared; Auto Memory is per-developer, per-machine.

---

## Before the Session — Prerequisite Check

Auto Memory requires Claude Code v2.1.59 or later and must be explicitly enabled.  
This is on the 48-hr pre-flight checklist — every attendee should have done this already.

Verify at session start: ask the room to type `/memory` in their Claude Code terminal.  
- If it shows a memory file path → enabled, good.  
- If it says "memory not enabled" or similar → they missed the pre-flight step. Have them run:

```
/memory enable
```

Do not spend more than 60 seconds on stragglers. Move on — they can catch up.

---

## Without Auto Memory — What the Room Recognises

Do not demo the "without" state here — the room has already lived it.  
Instead, just name it:

> "How many of you have had to tell Claude the same thing twice? Same session, different session — 'we use bun, not npm', 'our modules follow vertical slice', 'always use the Result pattern'. You told it once. New session — gone."

> "That is the stateless problem from Session 1. Every call starts from zero. CLAUDE.md solves it for project facts the whole team shares. But what about things only you know — your personal working style, your machine setup, preferences you haven't written down for the team?"

> "That is what Auto Memory is for."

---

## The Demo — 3 Steps

### Step 1 — Seed a memory (1 min)

In Claude Code, in the `learn-ai` repo, type:

```
Remember that we use bun, not npm, for the Client.React frontend.
```

Claude will confirm it saved something. It will say something like:

> "I'll remember that. I've noted that this project uses bun instead of npm for the Client.React frontend."

### Step 2 — Browse what was saved (2 min)

Type:

```
/memory
```

Claude Code opens the memory file. Show it on screen. The room sees a plain markdown file — Claude wrote it automatically. Point out:

- It's a file on your machine, not in the repo
- Claude wrote it — you did not
- It will be read at the start of every future session in this project

Say to the room:

> "This is not magic. It is the same mechanism as CLAUDE.md — text fed to the model at the start of every call. The difference is Claude wrote this one, not you. And it lives on your machine, not in the repo."

### Step 3 — Show it working in a new context (2 min)

Without closing the session, ask:

```
How should I install the frontend dependencies for this project?
```

Claude will say "use bun" — not because it's in CLAUDE.md (it isn't in the weakened version), but because it read the Auto Memory entry.

Say to the room:

> "Claude remembered. Not because we told it in this message. Not because it's in CLAUDE.md. Because it wrote a note to itself and read it back."

---

## The Distinction — Make It Explicit

Draw this on the whiteboard or show the slide:

| | CLAUDE.md | Auto Memory |
|---|---|---|
| Who writes it | You and your team | Claude writes it automatically |
| Where it lives | In the repo (committed) | On your machine (local only) |
| Who sees it | Everyone who clones the repo | Only you, on this machine |
| What it's for | Team-shared project facts | Personal working context, per-developer notes |
| Synced across team | Yes — via git | No — by design |

Say to the room:

> "If a manager asks 'can we standardise Auto Memory across the team?' — the honest answer is no, by design. For team-shared knowledge, use CLAUDE.md. They serve different jobs."

---

## What Not to Do

- Do not spend more than 5 minutes here. Auto Memory is important but it is not the hands-on block — Skills, MCP, and Hooks are.
- Do not let the room start experimenting with `/memory` during this block. Tell them: "You now know it exists and how to use it. We will come back to personal setup in Part C."
- Do not rename or call it "project memory" — the terminology tag at 0:00 already established why we say "Auto Memory" for this and "project context" for CLAUDE.md.

---

## Facilitator Notes

- The seed phrase "Remember that we use bun, not npm" is deliberate — it is a fact that is NOT in the weakened CLAUDE.md, so the demo is clean. After the demo, the full CLAUDE.md (which does mention bun) is already committed — no conflict.
- Auto Memory entries persist across sessions on your machine. Clear your own memory before each delivery so the demo starts fresh: open `/memory` and delete the bun entry manually before the session.
- If an attendee asks "where is the memory file stored?" — it is in the Claude Code data directory on their machine (platform-specific path). They do not need to know the exact path; `/memory` is the interface.
