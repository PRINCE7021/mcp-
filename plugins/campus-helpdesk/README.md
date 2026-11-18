# Campus Helpdesk Plugin

`campus-helpdesk` is an all-in-one assistant bundle for Nimbus University students and staff.

## Included Components

1. **Skill**: `timetable-helper` (progressive disclosure for timetable lookups, reference edge cases, and anti-fabrication).
2. **Slash Command**: `/timetable [batch] [day]` for direct lookups.
3. **Lifecycle Hook**: `protect-folders` (intercepts `write_file` and `edit_file` to prevent modifying protected directories).
4. **MCP Server Integration**: Connects to the `campus-data` MCP server exposing `get_timetable`, `get_fee_status`, and `hostel-rules://campus/rules`.
5. **Rules**: `rules/AGENTS.md` governing official conduct, privacy, and grounded responses.

## Installation & Lifecycle

### 1. Register Marketplace Catalog
Add the local repository or remote catalog to your plugin discovery configuration:
```bash
agy marketplace add file://$(pwd)/plugins/campus-helpdesk
```

### 2. Install Plugin
```bash
agy plugin install campus-helpdesk
# Or via Language Server RPC:
source /tmp/lsrpc.sh && lsrpc InstallCustomization '{"id":"campus-helpdesk"}'
```

### 3. Verify Active State
```bash
source /tmp/lsrpc.sh && lsrpc GetAllPlugins '{}' | jq '.plugins[] | select(.name=="campus-helpdesk")'
```

### 4. Uninstall Plugin
```bash
agy plugin uninstall campus-helpdesk
# Or via Language Server RPC:
source /tmp/lsrpc.sh && lsrpc DeletePlugin '{"pluginId":"campus-helpdesk"}'
```
