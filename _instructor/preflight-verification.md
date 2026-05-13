# Session 3 — Pre-flight Verification Checklist
## Complete this before the workshop. Takes ~30 minutes.

If any step fails, message Prabhjot on WhatsApp or email 008prabhjot@gmail.com before the session.

---

## Step 1 — Claude Code

**Install:** https://docs.claude.com/en/docs/claude-code/getting-started

**Verify version:**
```
claude --version
```
Expected: `2.1.59` or higher.

If lower: update Claude Code before continuing.

---

## Step 2 — Enable Auto Memory

Open a terminal and start Claude Code in any folder:
```
claude
```

Then type:
```
/memory
```

Expected: Claude Code shows a memory file path and confirms Auto Memory is enabled.

If it says memory is not enabled, run:
```
/memory enable
```

Then type `/memory` again and confirm it shows the file path.

---

## Step 3 — .NET 10 SDK

**Verify:**
```
dotnet --list-sdks
```

Expected: at least one entry starting with `10.` — for example `10.0.100`.

If not listed: download and install from https://dotnet.microsoft.com/download/dotnet/10.0

---

## Step 4 — Bun

**Install:** https://bun.sh

```
curl -fsSL https://bun.sh/install | bash
```

**Verify:**
```
bun --version
```

Expected: any version number, e.g. `1.1.x`.

---

## Step 5 — Docker Desktop

**Install:** https://www.docker.com/products/docker-desktop

**Start Docker Desktop** and wait for it to show "Engine running".

**Verify:**
```
docker ps
```

Expected: command runs without error (empty table is fine — it just means no containers are running yet).

If you see "Cannot connect to the Docker daemon" — Docker Desktop is not running. Start it and wait 30 seconds.

---

## Step 6 — Clone and build the workshop repo

```
git clone -b training https://github.com/008programmer/learn-ai.git
cd learn-ai
dotnet build ModularMonolithTemplate.sln
```

Expected output (last two lines):
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

If the build fails — copy the error and message Prabhjot before the session.

---

## Step 7 — Clone your own work repo

We use your real project in the final 25 minutes of the workshop (Part C).

Clone it now and confirm it builds:
```
git clone <your-repo-url>
cd <your-repo>
dotnet build   # or whatever your build command is
```

You do not need to do anything with it yet — just have it cloned and building locally.

---

## All done?

If all seven steps show the expected output, you are ready. See you at the workshop.

If anything failed — message Prabhjot today, not tomorrow morning:  
**008prabhjot@gmail.com**

---

## Quick reference — all verification commands

```
claude --version                          # must be 2.1.59+
# /memory (inside claude) — must be enabled
dotnet --list-sdks                        # must show 10.x
bun --version                            # any version
docker ps                                # must not error
dotnet build ModularMonolithTemplate.sln # must say Build succeeded
```
