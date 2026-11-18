#!/usr/bin/env node
/**
 * Automated MCP Stdio Protocol Test Client
 * Sends JSON-RPC 2.0 frames over stdin and parses stdout responses.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.join(__dirname, "server.js");

const serverProcess = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", "inherit"],
});

let messageId = 1;
const pendingRequests = new Map();
let buffer = "";

serverProcess.stdout.on("data", (data) => {
  buffer += data.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop(); // Keep unfinished line

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const json = JSON.parse(line);
      if (json.id && pendingRequests.has(json.id)) {
        const { resolve } = pendingRequests.get(json.id);
        pendingRequests.delete(json.id);
        resolve(json);
      }
    } catch (e) {
      console.error("Non-JSON stdout line:", line);
    }
  }
});

function sendRequest(method, params = {}) {
  const id = messageId++;
  const payload = {
    jsonrpc: "2.0",
    id,
    method,
    params,
  };

  return new Promise((resolve) => {
    pendingRequests.set(id, { resolve, method });
    const raw = JSON.stringify(payload) + "\n";
    serverProcess.stdin.write(raw);
  });
}

function sendNotification(method, params = {}) {
  const payload = {
    jsonrpc: "2.0",
    method,
    params,
  };
  serverProcess.stdin.write(JSON.stringify(payload) + "\n");
}

async function runExchange() {
  console.log("================================================================================");
  console.log("       MCP PROTOCOL STDIO VERIFICATION & CAPABILITY NEGOTIATION TRACE           ");
  console.log("================================================================================\n");

  // Step 1: Initialize Exchange
  console.log(">>> [STEP 1: INITIALIZE & CAPABILITY NEGOTIATION]");
  const initReq = {
    protocolVersion: "2024-11-05",
    capabilities: {
      roots: { listChanged: true },
      sampling: {},
    },
    clientInfo: {
      name: "NimbusHelpdeskClient",
      version: "1.0.0",
    },
  };
  console.log("--> Client Request (initialize):");
  console.log(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: initReq }, null, 2));

  const initResp = await sendRequest("initialize", initReq);
  console.log("<-- Server Response (initialize):");
  console.log(JSON.stringify(initResp, null, 2));

  sendNotification("notifications/initialized");
  console.log("--> Client Notification sent: notifications/initialized\n");

  // Step 2: Tools List
  console.log(">>> [STEP 2: TOOLS DISCOVERY (tools/list)]");
  console.log("--> Client Request (tools/list):");
  console.log(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, null, 2));

  const toolsResp = await sendRequest("tools/list", {});
  console.log("<-- Server Response (tools/list):");
  console.log(JSON.stringify(toolsResp, null, 2));

  // Step 3: Tool Call (get_timetable)
  console.log("\n>>> [STEP 3: EXECUTE TOOL (tools/call -> get_timetable)]");
  const callReq = {
    name: "get_timetable",
    arguments: {
      batch: "CSE-2A",
      day: "Monday",
    },
  };
  console.log("--> Client Request (tools/call):");
  console.log(JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: callReq }, null, 2));

  const callResp = await sendRequest("tools/call", callReq);
  console.log("<-- Server Response (tools/call):");
  console.log(JSON.stringify(callResp, null, 2));

  // Step 4: Tool Call (get_fee_status - success)
  console.log("\n>>> [STEP 4: EXECUTE TOOL (tools/call -> get_fee_status - Success Case)]");
  const feeReq = {
    name: "get_fee_status",
    arguments: {
      student_id: "STU1042",
    },
  };
  console.log("--> Client Request (tools/call):");
  console.log(JSON.stringify({ jsonrpc: "2.0", id: 4, method: "tools/call", params: feeReq }, null, 2));

  const feeResp = await sendRequest("tools/call", feeReq);
  console.log("<-- Server Response (tools/call):");
  console.log(JSON.stringify(feeResp, null, 2));

  // Step 5: Tool Call Failure Case (Schema / Regex Validation Failure)
  console.log("\n>>> [STEP 5: TOOL EXECUTION FAILURE (Schema / Bad Input Case)]");
  const badFeeReq = {
    name: "get_fee_status",
    arguments: {
      student_id: "INVALID_ID_999",
    },
  };
  console.log("--> Client Request (tools/call with invalid student_id):");
  console.log(JSON.stringify({ jsonrpc: "2.0", id: 5, method: "tools/call", params: badFeeReq }, null, 2));

  const badFeeResp = await sendRequest("tools/call", badFeeReq);
  console.log("<-- Server Response (Error Reporting with isError: true):");
  console.log(JSON.stringify(badFeeResp, null, 2));

  // Step 6: Resource Inspection
  console.log("\n>>> [STEP 6: RESOURCE RETRIEVAL (resources/read -> hostel-rules://campus/rules)]");
  const readResReq = {
    uri: "hostel-rules://campus/rules",
  };
  console.log("--> Client Request (resources/read):");
  console.log(JSON.stringify({ jsonrpc: "2.0", id: 6, method: "resources/read", params: readResReq }, null, 2));

  const readResResp = await sendRequest("resources/read", readResReq);
  console.log("<-- Server Response (resources/read):");
  console.log(JSON.stringify(readResResp, null, 2));

  console.log("\n================================================================================");
  console.log("                      ALL MCP TEST EXCHANGES COMPLETED                          ");
  console.log("================================================================================");

  serverProcess.kill();
  process.exit(0);
}

runExchange().catch((err) => {
  console.error("Test client error:", err);
  serverProcess.kill();
  process.exit(1);
});
