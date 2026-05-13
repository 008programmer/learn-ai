# Pre-flight Email — Session 3
## Send 48 hours before the workshop

---

**Subject:** Action required before tomorrow's AI Dev Workshop — 30-min setup

---

Hi [Name],

Looking forward to the workshop tomorrow. Session 3 is fully hands-on — every demo runs live on your laptop — so I need you to complete a quick setup before you arrive. It takes about 30 minutes.

**Please do this today, not tomorrow morning.**

If anything breaks during setup, message me on WhatsApp or reply to this email and I will help you sort it out before the session.

---

## What you need to install and verify

Full step-by-step instructions are in the attached verification doc. Here is the summary:

1. **Claude Code** — v2.1.59 or later — [install guide](https://docs.claude.com/en/docs/claude-code/getting-started)
2. **Auto Memory enabled** — run `/memory` in Claude Code and confirm it is on
3. **.NET 10 SDK** — verify with `dotnet --list-sdks`
4. **Bun** — for the React frontend — [bun.sh](https://bun.sh)
5. **Docker Desktop** — must be running — [docker.com](https://www.docker.com/products/docker-desktop)
6. **Sample repo cloned and building** — clone the workshop repo and confirm `dotnet build` passes
7. **Your own work repo cloned** — we will use this in the final 25 minutes

Each step has a verification command in the attached doc. Run every one of them and confirm you see the expected output.

---

## The workshop repo

```
git clone -b training https://github.com/008programmer/learn-ai.git
cd learn-ai
dotnet build ModularMonolithTemplate.sln
```

The last command must complete with **Build succeeded** before you arrive. If it fails, message me.

---

## Why this matters

The entire workshop runs against this repo and your local environment. If Docker is not running, one of the demos will not work. If Auto Memory is not enabled, you will miss part of the hands-on. Five minutes of setup today saves everyone from support calls during the session.

See you tomorrow.

— Prabhjot Singh  
Step2Gen Technologies  
008prabhjot@gmail.com
