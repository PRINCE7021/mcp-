---
name: timetable-helper
description: >-
  Answers campus timetable and schedule queries for student batches and courses
  using university timetable CSV data. Triggers when students ask about class timings,
  room locations, course schedules, or daily batch timetables.
---

# Timetable Helper Skill

Provides accurate, verified classroom schedule lookups for Nimbus University students and faculty.

## Execution Workflow

1. **Extract Search Criteria**:
   Identify the student batch (e.g., `CSE-2A`, `CSE-2B`, `ECE-1A`), day of the week (`Monday`–`Friday`), time range (morning/afternoon), or specific course code (`CS201`).
   - If batch or day is missing, consult the column definitions and valid values in [CSV Schema Reference](./references/csv_schema.md).
   - If unusual queries or weekend questions arise, consult [Edge Cases Reference](./references/edge_cases.md).

2. **Retrieve Data via Helper Script**:
   Execute the query helper script to deterministically inspect records:
   ```bash
   python3 ./scripts/lookup_timetable.py --batch "<BATCH>" --day "<DAY>"
   ```
   Or query by specific course code:
   ```bash
   python3 ./scripts/lookup_timetable.py --batch "<BATCH>" --course "<COURSE_CODE>"
   ```

3. **Format Response**:
   Present class results with start/end time, course code, course name, assigned instructor, and classroom/lab venue.

## Critical Anti-Fabrication & Security Instruction

> [!CAUTION]
> **STRICT FACTUAL GROUNDING MANDATE**:
> You must NEVER invent, extrapolate, or hallucinate course names, course codes, instructors, room numbers, or class times that do not exist in `resources/timetable.csv`.
> If a student inquires about an unregistered course (such as "Quantum Bio-Computing" or unlisted electives) or a batch with no scheduled session, you MUST state:
> *"According to the official Nimbus University timetable records, no course named '[Course Name]' is scheduled for batch [Batch] on [Day]. Please verify with the Academic Coordinator."*
> Never generate hypothetical schedules or assume typical hours.
