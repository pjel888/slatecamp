# Hermes Commands Cheatsheet

## Setup and health

```bash
hermes doctor
hermes model
hermes config
hermes config check
```

## Chat

```bash
hermes chat
hermes --tui
hermes chat -q "Use the slatecamp-orientation skill and inspect the repo."
```

## Project workflow

```bash
cd /path/to/slatecamp
hermes chat
```

In chat:

```text
/skills
/slatecamp-orientation
/rollback
/rollback diff 1
```

## Recovery

Use `/rollback` for agent-driven file changes. Prefer previewing a rollback diff before restoring.
