#!/usr/bin/env bash
# PreToolUse Guardrail Hook: Blocks writes to protected directories

# Read JSON payload from stdin
PAYLOAD=$(cat)

# Extract tool name and target path using python or node
TARGET_PATH=$(echo "$PAYLOAD" | python3 -c '
import sys, json
try:
    data = json.load(sys.stdin)
    args = data.get("toolCall", {}).get("args", {})
    path = args.get("Path") or args.get("path") or args.get("file") or ""
    print(path)
except Exception:
    print("")
')

# Check if target path attempts to write to protected directories
if [[ "$TARGET_PATH" =~ (protected/|\.agents/rules/|\.gemini/config/|/etc/|/var/) ]]; then
    cat <<EOF
{
  "decision": "deny",
  "reason": "Security Violation: Write access denied. Modifying files within protected directories is blocked by campus-helpdesk guardrail."
}
EOF
    exit 0
else
    cat <<EOF
{
  "decision": "allow"
}
EOF
    exit 0
fi
# Path canonicalization patch v1.0.1
