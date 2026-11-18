# University Timetable CSV Data Dictionary & Schema

This reference outlines the schema, column definitions, acceptable formats, and validation rules for `resources/timetable.csv`.

## Column Definitions

| Column Name | Type | Allowed Values / Format | Description |
| :--- | :--- | :--- | :--- |
| `batch` | String | `CSE-2A`, `CSE-2B`, `ECE-1A`, `MECH-3A` | Academic cohort identifier. Must be uppercase with hyphen. |
| `day` | String | `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday` | Weekday of the session. Case-insensitive lookup; canonical is Title Case. |
| `start_time` | String | `HH:MM` (24-hour format) | Lecture start time (e.g., `09:00`, `14:00`). |
| `end_time` | String | `HH:MM` (24-hour format) | Lecture end time (e.g., `10:30`, `16:00`). |
| `course_code`| String | Alphanumeric (e.g., `CS201`, `CS201L`) | Official university course catalog code. Suffix `L` denotes laboratory. |
| `course_name`| String | Text (e.g., `Data Structures & Algorithms`) | Full descriptive name of the enrolled subject. |
| `instructor` | String | Title + Name (e.g., `Prof. Alan Turing`) | Assigned primary faculty member. |
| `room_number`| String | `LH-###`, `Lab-#`, `Room-###` | Designated classroom or laboratory venue. |

## Query Validation Rules

1. **Batch Filtering**: Always match batch against exact identifiers (`CSE-2A`, not `2A` or `CSE2`).
2. **Time Ranges**: 
   - "Morning": 08:00 to 12:00.
   - "Afternoon": 12:00 to 17:00.
   - "Evening": 17:00 onwards (no standard classes currently scheduled).
3. **Lab Sessions**: Lab entries (marked with `L` code) span 2-hour blocks and require laboratory venues (`Lab-1` through `Lab-4`).
