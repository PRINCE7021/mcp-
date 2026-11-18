# Part B: Design and Test a Skill (20 Marks)

## 1. Skill Architecture & Progressive Disclosure Design

The `timetable-helper` skill is designed to provide reliable, deterministic schedule lookups for university students while strictly preventing LLM hallucinations. To minimize context bloat and optimize token usage, the skill adheres to the **progressive disclosure pattern**:

```text
skills/timetable-helper/
├── SKILL.md                          # Lightweight instructions & anti-fabrication rules (loaded on demand)
├── references/
│   ├── csv_schema.md                 # Detailed column dictionary & query constraints
│   └── edge_cases.md                 # Protocol for holidays, cancellations, aliases
├── scripts/
│   └── lookup_timetable.py           # Deterministic Python lookup helper
└── resources/
    └── timetable.csv                 # Official university timetable dataset
```

### Progressive Disclosure Mechanics
1. **Tier 1 (Startup Metadata)**: Only the YAML frontmatter (`name` and `description`) is preloaded into the LLM system prompt (~40 tokens). The LLM knows *what* the skill does and *when* to trigger it without carrying the full instruction set.
2. **Tier 2 (Activation / Full Instructions)**: When the user's intent matches a timetable query, the primary agent fetches `SKILL.md`.
3. **Tier 3 (On-Demand References & Execution)**: The agent executes `scripts/lookup_timetable.py` to query `resources/timetable.csv`. If anomalous batch codes or edge cases occur, it selectively reads `references/csv_schema.md` or `references/edge_cases.md` without polluting global context.

---

## 2. Complete `SKILL.md` Implementation

```markdown
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
```

---

## 3. Systematic Prompt Testing (6 Test Cases)

To validate the trigger boundary and defense robustness of `timetable-helper`, six distinct prompts were evaluated using the automated test suite `tests/test_skill_prompts.py`:

| Prompt ID | Category | Prompt Text | Triggered? | Reason / Activation Analysis |
| :---: | :---: | :--- | :---: | :--- |
| **P1** | **Trigger** | *"What classes does batch CSE-2A have on Monday morning?"* | **YES** | Matches core intent: specific batch (`CSE-2A`), weekday (`Monday`), and time window (`morning`). The skill executes `lookup_timetable.py` and returns `CS201` (09:00-10:30, LH-101) and `CS203` (10:45-12:15, LH-101). |
| **P2** | **Trigger** | *"Where is the CS201 Data Structures lecture held for CSE-2B on Wednesday?"* | **YES** | Matches course location query: batch (`CSE-2B`), course (`CS201`), weekday (`Wednesday`). The skill retrieves venue `Room-302`, time `10:00-11:30`, instructor `Prof. Alan Turing`. |
| **P3** | **Adversarial Trigger** | *"Tell me the classroom and timing for the Quantum Bio-Computing class for CSE-2A on Thursday."* | **YES** *(Skill triggers; fabrication blocked)* | The prompt attempts to induce the agent to hallucinate a non-existent course. The skill triggers, queries the CSV via `lookup_timetable.py`, detects 0 matches, and executes the **Anti-Fabrication Mandate**, strictly responding: *"According to official Nimbus University timetable records, no course named 'Quantum Bio-Computing' is scheduled for batch CSE-2A on Thursday."* |
| **P4** | **Non-Trigger** | *"How do I pay my semester tuition fees through the student portal?"* | **NO** | Financial inquiry regarding tuition fees. The description bounds the skill strictly to class schedules and venues; therefore, the agent correctly bypasses `timetable-helper` and directs the query to financial aid / bursar channels. |
| **P5** | **Non-Trigger** | *"What is the curfew time for girls' hostel block B on weekends?"* | **NO** | Residential life / hostel accommodation policy query. Correctly excluded by description boundary. This query belongs to the hostel regulations resource (`hostel-rules://campus/rules`), not the timetable skill. |
| **P6** | **Ambiguous** | *"When is Professor Sharma available this week?"* | **NO** *(Boundary Test)* | Inquires about faculty availability without specifying a lecture schedule or batch. The skill description specifies "class timings, room locations, course schedules, or daily batch timetables". The agent determines that faculty office hours are administrative, checks if Prof. Sharma appears in the timetable (unlisted), and asks the user whether they seek lecture timings or private office consultation. |

---

## 4. Description Optimization & Trigger Sensitivity Analysis

The frontmatter description is the sole gatekeeper for model activation. We tested three description formulations across our prompt suite:

```text
Variant 1 (Balanced - Production):
"Answers campus timetable and schedule queries for student batches and courses using university timetable CSV data. Triggers when students ask about class timings, room locations, course schedules, or daily batch timetables."

Variant 2 (Overly Broad):
"Answers any questions about university schedules, campus events, academics, faculty, timings, and university planning."

Variant 3 (Overly Narrow):
"Looks up Monday morning lecture classrooms for batch CSE-2A from the timetable CSV."
```

### Empirical Trigger Comparison Matrix

| Prompt ID | Prompt Summary | V1: Balanced (Optimal) | V2: Too Broad (Over-Trigger) | V3: Too Narrow (Under-Trigger) |
| :---: | :--- | :---: | :---: | :---: |
| **P1** | CSE-2A Monday Morning | **TRIGGERED** (Valid) | **TRIGGERED** (Valid) | **TRIGGERED** (Valid) |
| **P2** | CSE-2B Wednesday Room | **TRIGGERED** (Valid) | NOT TRIGGERED (Missed due to generic keywords) | **MISSED** (False Negative: wrong batch/day) |
| **P3** | Adversarial Quantum Class | **TRIGGERED** (Valid & Defended) | **TRIGGERED** (Valid) | **MISSED** (False Negative: wrong day) |
| **P4** | Tuition Fee Payment | **REJECTED** (Correct) | **SPURIOUS TRIGGER** (False Positive: matched 'academic') | **REJECTED** (Correct) |
| **P5** | Hostel Curfew Timing | **REJECTED** (Correct) | **SPURIOUS TRIGGER** (False Positive: matched 'timings') | **REJECTED** (Correct) |
| **P6** | Prof Availability | **REJECTED** (Correct) | **SPURIOUS TRIGGER** (False Positive: matched 'faculty') | **REJECTED** (Correct) |

### Key Findings on Description Design
1. **What Makes a Description Too Broad**:
   Generic catch-all terms ("any questions", "university planning", "timings", "events") cause severe semantic drift. In Variant 2, words like "timings" caused the model to spuriously activate `timetable-helper` for residential curfew hours (P5) and academic payment windows (P4). This wastes prompt tokens, introduces context confusion, and slows agent response latency.
2. **What Makes a Description Too Narrow**:
   Over-fitting to specific examples or subsets (e.g., hardcoding "Monday morning CSE-2A" in Variant 3) causes brittle trigger failures. The skill completely failed to recognize legitimate queries for CSE-2B (P2) and Thursday lectures (P3), causing the agent to fall back to unassisted, ungrounded responses.
3. **The Goldilocks Principle for Skills**:
   An optimal skill description specifies **both the functional capability** ("Answers campus timetable and schedule queries...") and **explicit trigger conditions** ("Triggers when students ask about class timings, room locations, course schedules, or daily batch timetables").

---

## 5. Adversarial Testing & Anti-Fabrication Safeguard

### The Adversarial Attack
Prompt P3 specifically introduces a plausible-sounding but fictitious university course:
> *"Tell me the classroom and timing for the Quantum Bio-Computing class for CSE-2A on Thursday."*

Large language models inherently exhibit a tendency to generate plausible completions when queried about non-existent academic entities (e.g., fabricating "Quantum Bio-Computing is held in LH-305 at 11:00 AM by Dr. Smith").

### Skill Defense Mechanism
Our skill counteracts this via a three-layer defense:
1. **Deterministic Script Grounding**: The skill instructs the agent to query `scripts/lookup_timetable.py --batch CSE-2A --day Thursday --course "Quantum Bio-Computing"`. The script scans `resources/timetable.csv` and returns `count: 0`.
2. **Explicit Fallback Directive**: Rather than permitting the model to speculate when zero records return, `SKILL.md` contains an unconditional negative constraint:
   > *"If a student inquires about an unregistered course... you MUST state: 'According to the official Nimbus University timetable records, no course named [Course Name] is scheduled for batch [Batch] on [Day].'"*
3. **Verified Output**:
   ```text
   Official Timetable Records: 0 entries found.
   Agent Response: "According to the official Nimbus University timetable records, no course named 'Quantum Bio-Computing' is scheduled for batch CSE-2A on Thursday. Please verify with the Academic Coordinator."
   ```
This completely neutralizes the hallucination vector.
