# MCP Server Configuration

This document contains the configuration for the `@21st-dev/magic` MCP server.

## Configuration

Add the following configuration to your Cursor IDE settings:

### Option 1: Global Cursor Settings

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Search for "MCP" or "Model Context Protocol"
3. Add the following JSON configuration:

```json
{
  "mcpServers": {
    "@21st-dev/magic": {
      "command": "npx",
      "args": [
        "-y",
        "@21st-dev/magic@latest",
        "API_KEY=\"54921ba4f627aee83a0d000b99a472912e3e58591b8dff5b73bbd7f13d4b59af\""
      ]
    }
  }
}
```

### Option 2: Settings JSON File

1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Type "Preferences: Open User Settings (JSON)"
3. Add the configuration to your settings.json file

### Option 3: Project-specific Configuration

If you want this configuration to be project-specific, create a `.cursor/mcp.json` file in your project root with the above configuration.

## Notes

- The `@21st-dev/magic` server will be automatically installed via `npx` when needed
- The API key is included in the configuration
- Make sure you have `npx` available in your PATH

