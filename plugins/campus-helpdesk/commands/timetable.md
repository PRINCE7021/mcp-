---
name: timetable
description: Look up classroom timetables and schedules for university batches and courses.
usage: /timetable [batch] [day]
---

# Timetable Slash Command (`/timetable`)

Directly triggers a schedule query against the `timetable-helper` skill and campus data MCP server.

## Arguments
- `batch` (optional): Student batch code (e.g., `CSE-2A`, `CSE-2B`, `ECE-1A`).
- `day` (optional): Weekday (`Monday` through `Friday`).

## Behavior
When invoked:
1. If both `batch` and `day` are provided, the agent immediately executes the query without asking clarifying questions.
2. If arguments are omitted, the agent prompts the user to select their batch and day.
3. Automatically enforces strict grounding against official university records.
