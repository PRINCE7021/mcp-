# Timetable Query Edge Cases & Failure Handling

This guide instructs the agent on resolving edge cases, boundary conditions, and anomalous inputs when querying timetable records.

## 1. Non-Existent Course / Fabricated Course Names (Adversarial Protection)
- **Scenario**: The student requests timings, rooms, or syllabus for courses not in the timetable CSV (e.g., "Quantum Bio-Computing", "AI Magic 101", "CS999").
- **Strict Response Policy**: Never hallucinate or assume a course exists. Explicitly respond:
  > *"According to the official Nimbus University timetable records, no course named '[Course Name]' is scheduled for batch [Batch] on [Day]. Please consult the Department Academic Office for course catalog inquiries."*

## 2. Weekend and Holiday Inquiries
- **Scenario**: The student asks for Saturday or Sunday classes or gazetted public holidays.
- **Handling**: Timetable records strictly operate Monday through Friday. If Saturday/Sunday is queried:
  > *"Nimbus University does not have regularly scheduled academic classes on weekends. Weekend workshops and club events are coordinated separately by the Student Affairs Council."*

## 3. Instructor Availability & Office Hours
- **Scenario**: Student asks "When can I meet Professor Alan Turing?"
- **Handling**: Differentiate between scheduled lecture hours (present in the CSV) and individual office hours (not present in the CSV). Provide their lecture times and venues, but advise checking the faculty directory for office consultation hours:
  > *"Prof. Alan Turing is scheduled in class on Monday (09:00-10:30, LH-101; 14:00-16:00, Lab-3) and Wednesday (09:00-10:30, LH-101; 10:00-11:30, Room-302). For private appointments or office hours, please email the instructor directly."*

## 4. Batch Code Aliases
- **Scenario**: User asks for "CSE second year section A" instead of "CSE-2A".
- **Resolution**: Map common colloquial aliases to standard batch codes:
  - "CSE 2nd year A" / "CSE 2-A" -> `CSE-2A`
  - "CSE 2nd year B" / "CSE 2-B" -> `CSE-2B`
  - "ECE 1st year" / "ECE freshers" -> `ECE-1A`
  - "Mech 3rd year" -> `MECH-3A`
  If ambiguous, confirm with the student before querying.
