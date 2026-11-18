#!/usr/bin/env node
/**
 * Nimbus Campus Helpdesk MCP Server
 * Built with official @modelcontextprotocol/sdk
 * Transport: stdio
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Mock Data Store
const MOCK_TIMETABLES = [
  { batch: "CSE-2A", day: "Monday", time: "09:00-10:30", code: "CS201", course: "Data Structures & Algorithms", instructor: "Prof. Alan Turing", room: "LH-101" },
  { batch: "CSE-2A", day: "Monday", time: "10:45-12:15", code: "CS203", course: "Computer Organization & Architecture", instructor: "Dr. John von Neumann", room: "LH-101" },
  { batch: "CSE-2A", day: "Monday", time: "14:00-16:00", code: "CS201L", course: "Data Structures Lab", instructor: "Prof. Alan Turing", room: "Lab-3" },
  { batch: "CSE-2A", day: "Tuesday", time: "09:00-10:30", code: "CS202", course: "Discrete Mathematics", instructor: "Prof. Ada Lovelace", room: "LH-102" },
  { batch: "CSE-2A", day: "Wednesday", time: "09:00-10:30", code: "CS201", course: "Data Structures & Algorithms", instructor: "Prof. Alan Turing", room: "LH-101" },
  { batch: "CSE-2B", day: "Wednesday", time: "10:00-11:30", code: "CS201", course: "Data Structures & Algorithms", instructor: "Prof. Alan Turing", room: "Room-302" },
  { batch: "ECE-1A", day: "Monday", time: "09:00-10:30", code: "EC101", course: "Digital Logic Design", instructor: "Prof. Claude Shannon", room: "LH-201" }
];

const MOCK_FEES = {
  "STU1042": {
    student_id: "STU1042",
    student_name: "Alex Mercer",
    term: "Fall 2026",
    total_due: 4500.00,
    amount_paid: 4500.00,
    outstanding_balance: 0.00,
    status: "PAID_IN_FULL",
    receipt_number: "REC-98211",
    payment_date: "2026-08-15"
  },
  "STU1088": {
    student_id: "STU1088",
    student_name: "Maya Lin",
    term: "Fall 2026",
    total_due: 4500.00,
    amount_paid: 2500.00,
    outstanding_balance: 2000.00,
    status: "PARTIAL_PAYMENT",
    receipt_number: "REC-98402",
    payment_date: "2026-08-20",
    due_date: "2026-11-30"
  },
  "STU1105": {
    student_id: "STU1105",
    student_name: "David Chen",
    term: "Fall 2026",
    total_due: 4500.00,
    amount_paid: 0.00,
    outstanding_balance: 4500.00,
    status: "OVERDUE",
    receipt_number: null,
    payment_date: null,
    due_date: "2026-10-15",
    hold_placed: true
  }
};

const HOSTEL_RULES_CONTENT = `# Nimbus University Residential & Hostel Code of Conduct

## 1. General Conduct
Residents must maintain decorum and respect the rights of fellow community members.
Identification cards must be produced upon security officer request at all entry checkpoints.

## 2. Quiet Hours and Curfew
- **Quiet Hours**: 22:30 to 06:00 daily. Amplified music and loud group discussions in corridors are prohibited.
- **Main Gate Curfew**: 
  - Sunday through Thursday: 22:00.
  - Friday and Saturday: 23:00.
Late entry requires prior written approval from the Hall Warden via the Nimbus Student Portal.

## 3. Visitors and Guest Policy
- External guests are permitted exclusively in common lounge areas between 09:00 and 19:00.
- Overnight guests are strictly prohibited without a Warden-signed Visitor Pass issued 24 hours in advance.
- No opposite-gender guests are permitted in resident residential wings at any time.

## 4. Prohibited Items & Safety
- Cooking appliances (hotplates, induction heaters, immersion coils) are banned in individual rooms.
- Possession of alcohol, tobacco, narcotics, or hazardous chemicals incurs immediate suspension and disciplinary hearing.
- Tampering with fire alarms, smoke detectors, or extinguishers is a criminal violation.

## 5. Maintenance and Inspection
The University administration reserves the right to perform routine health, safety, and inventory inspections with prior notice.
Emergency inspections may occur without notice if safety violations are suspected.
`;

// Initialize Server
const server = new Server(
  {
    name: "nimbus-campus-helpdesk",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Register Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "hostel-rules://campus/rules",
        name: "Nimbus Hostel Rules and Regulations",
        mimeType: "text/markdown",
        description: "Official resident regulations, quiet hours, curfew timings, and visitor policies for Nimbus University campus hostels.",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri === "hostel-rules://campus/rules") {
    return {
      contents: [
        {
          uri: "hostel-rules://campus/rules",
          mimeType: "text/markdown",
          text: HOSTEL_RULES_CONTENT,
        },
      ],
    };
  }
  throw new Error(`Resource not found: ${uri}`);
});

// Register Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_timetable",
        description:
          "Fetches official academic lecture schedules, course codes, instructors, and room numbers for a given student batch and weekday. Always provide a valid batch code (e.g., CSE-2A) and standard day (Monday-Friday).",
        inputSchema: {
          type: "object",
          properties: {
            batch: {
              type: "string",
              description: "Student cohort batch identifier (e.g. 'CSE-2A', 'CSE-2B', 'ECE-1A').",
            },
            day: {
              type: "string",
              description: "Day of the week (e.g. 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday').",
            },
          },
          required: ["batch", "day"],
        },
      },
      {
        name: "get_fee_status",
        description:
          "Retrieves tuition fee payment status, outstanding balance, receipt number, and payment deadlines for a student. Requires an official student identifier formatted as 'STU' followed by 4 digits (e.g., 'STU1042').",
        inputSchema: {
          type: "object",
          properties: {
            student_id: {
              type: "string",
              pattern: "^STU[0-9]{4}$",
              description: "The unique student ID in uppercase format 'STU####' (e.g., 'STU1042').",
            },
          },
          required: ["student_id"],
        },
      },
    ],
  };
});

// Tool Call Execution Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_timetable") {
    const { batch, day } = args || {};
    if (!batch || !day) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Error: Both 'batch' and 'day' parameters are required to lookup timetable records.",
          },
        ],
      };
    }

    const matched = MOCK_TIMETABLES.filter(
      (entry) =>
        entry.batch.toUpperCase() === String(batch).toUpperCase() &&
        entry.day.toLowerCase() === String(day).toLowerCase()
    );

    if (matched.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No scheduled classes found in official records for batch ${batch} on ${day}.`,
          },
        ],
      };
    }

    const formatted = matched
      .map(
        (m) =>
          `• ${m.time}: ${m.code} - ${m.course} | Room: ${m.room} | Instructor: ${m.instructor}`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Official Timetable for ${batch} on ${day}:\n${formatted}`,
        },
      ],
    };
  }

  if (name === "get_fee_status") {
    const { student_id } = args || {};
    if (!student_id) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Error: Missing required parameter 'student_id'.",
          },
        ],
      };
    }

    const idRegex = /^STU[0-9]{4}$/;
    if (!idRegex.test(String(student_id))) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Validation Error: Student ID '${student_id}' does not match the required schema pattern '^STU[0-9]{4}$' (e.g., STU1042).`,
          },
        ],
      };
    }

    const record = MOCK_FEES[String(student_id)];
    if (!record) {
      return {
        content: [
          {
            type: "text",
            text: `No fee ledger records located for student ID ${student_id}. Please contact the Bursar Office.`,
          },
        ],
      };
    }

    const summary = [
      `Fee Status Report for ${record.student_name} (${record.student_id}):`,
      `Term: ${record.term}`,
      `Status: ${record.status}`,
      `Total Assessed: $${record.total_due.toFixed(2)}`,
      `Amount Paid: $${record.amount_paid.toFixed(2)}`,
      `Outstanding Balance: $${record.outstanding_balance.toFixed(2)}`,
      record.receipt_number ? `Receipt No: ${record.receipt_number}` : `Due Date: ${record.due_date}`,
      record.hold_placed ? `WARNING: Registration hold active due to unpaid balance.` : `Account in good standing.`
    ].join("\n");

    return {
      content: [
        {
          type: "text",
          text: summary,
        },
      ],
    };
  }

  throw new Error(`Unknown tool requested: ${name}`);
});

// Start the server using StdioServerTransport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log strictly to stderr so stdout remains clean JSON-RPC
  console.error("Nimbus Campus Helpdesk MCP Server running on stdio transport.");
}

main().catch((err) => {
  console.error("Fatal server error:", err);
  process.exit(1);
});
// Version 1.0.1 - Added server uptime tracking
