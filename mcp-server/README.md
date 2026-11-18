# Nimbus Campus Helpdesk MCP Server

Official Model Context Protocol (MCP) server implementing student data tools and campus resources over `stdio` transport using `@modelcontextprotocol/sdk`.

## Overview & Findings Regarding `@nimbus/mcp-skill-bridge`

The project specification suggested evaluating the package `@nimbus/mcp-skill-bridge` (version 2.3) to "auto-convert Skills into MCP tools".
We performed a registry query against official package repositories:
```bash
npm view @nimbus/mcp-skill-bridge
```
**Finding**:
```text
npm error code E404
npm error 404 Not Found - GET https://registry.npmjs.org/@nimbus%2fmcp-skill-bridge - Not found
```
The suggested package `@nimbus/mcp-skill-bridge` is **non-existent (fabricated)**. Consequently, this server is implemented directly against the official, stable `@modelcontextprotocol/sdk` (v1.32.2) according to the MCP 2024-11-05 architecture specification.

---

## Exposed Primitives

### 1. Tools

#### `get_timetable`
- **Description**: Fetches official academic lecture schedules, course codes, instructors, and room numbers for a given student batch and weekday.
- **Parameters**:
  - `batch` (string, required): Cohort identifier (e.g. `CSE-2A`, `CSE-2B`, `ECE-1A`).
  - `day` (string, required): Weekday (`Monday` through `Friday`).

#### `get_fee_status`
- **Description**: Retrieves tuition fee payment status, outstanding balance, receipt number, and payment deadlines for a student.
- **Parameters**:
  - `student_id` (string, required): Student ID validated against schema pattern `^STU[0-9]{4}$` (e.g. `STU1042`).

### 2. Resources

#### `hostel-rules://campus/rules`
- **Name**: Nimbus Hostel Rules and Regulations
- **MIME Type**: `text/markdown`
- **Description**: Comprehensive official residential guidelines, quiet hours, curfew timings, and visitor policies.

---

## Run & Test Instructions

### Prerequisites
- Node.js >= 18.0.0
- Dependencies installed via `npm install`

### Starting the Server (Stdio)
```bash
node mcp-server/server.js
```

### Running Automated Test Suite & Protocol Trace
```bash
npm run test:mcp
# Or directly:
node mcp-server/test-client.js
```

### Testing with MCP Inspector
To run with the interactive MCP Inspector UI:
```bash
npx @modelcontextprotocol/inspector node mcp-server/server.js
```
