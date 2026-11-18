#!/usr/bin/env python3
"""
Timetable Lookup Script
Queries campus timetable CSV data deterministically with anti-fabrication guards.
Usage:
    python3 lookup_timetable.py --batch CSE-2A --day Monday
    python3 lookup_timetable.py --batch CSE-2B --course CS201
"""

import csv
import sys
import os
import argparse
import json

def get_default_csv_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(script_dir, "..", "resources", "timetable.csv")

def lookup_timetable(csv_path, batch=None, day=None, course=None, instructor=None):
    if not os.path.exists(csv_path):
        return {"status": "error", "message": f"Timetable file not found at {csv_path}"}

    results = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if batch and row["batch"].strip().upper() != batch.strip().upper():
                continue
            if day and row["day"].strip().lower() != day.strip().lower():
                continue
            if course:
                c_term = course.strip().lower()
                if c_term not in row["course_code"].strip().lower() and c_term not in row["course_name"].strip().lower():
                    continue
            if instructor and instructor.strip().lower() not in row["instructor"].strip().lower():
                continue
            results.append(row)

    return {
        "status": "success",
        "count": len(results),
        "query": {"batch": batch, "day": day, "course": course, "instructor": instructor},
        "records": results
    }

def main():
    parser = argparse.ArgumentParser(description="Query campus timetable CSV records.")
    parser.add_argument("--batch", help="Student batch code (e.g., CSE-2A, CSE-2B, ECE-1A)")
    parser.add_argument("--day", help="Day of the week (Monday - Friday)")
    parser.add_argument("--course", help="Course code or name substring")
    parser.add_argument("--instructor", help="Instructor name substring")
    parser.add_argument("--csv", default=get_default_csv_path(), help="Path to timetable.csv")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")

    args = parser.parse_args()

    data = lookup_timetable(args.csv, batch=args.batch, day=args.day, course=args.course, instructor=args.instructor)

    if args.json:
        print(json.dumps(data, indent=2))
        return

    if data["status"] == "error":
        print(f"Error: {data['message']}", file=sys.stderr)
        sys.exit(1)

    if data["count"] == 0:
        print("No matching scheduled classes found in the official timetable.")
        print(f"Query filters: batch={args.batch}, day={args.day}, course={args.course}")
        return

    print(f"\nOfficial Timetable Records ({data['count']} entries found):")
    print("-" * 88)
    print(f"{'Batch':<8} | {'Day':<9} | {'Time':<13} | {'Code':<7} | {'Course Name':<28} | {'Room':<8} | {'Instructor'}")
    print("-" * 88)
    for r in data["records"]:
        time_slot = f"{r['start_time']}-{r['end_time']}"
        print(f"{r['batch']:<8} | {r['day']:<9} | {time_slot:<13} | {r['course_code']:<7} | {r['course_name'][:28]:<28} | {r['room_number']:<8} | {r['instructor']}")
    print("-" * 88)

if __name__ == "__main__":
    main()
