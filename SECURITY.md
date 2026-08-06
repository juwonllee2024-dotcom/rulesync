# Security Policy

`RuleSync` takes security seriously. As a local developer CLI tool interacting with rule files, maintaining workspace boundaries and preventing path traversal or malicious instruction execution is a core architectural priority.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Model & Threat Boundaries

1. **Path Traversal Shield**: All input/output relative paths are validated against `process.cwd()` using `sanitizeWorkspacePath()`. Writes attempting to escape workspace boundaries (`../..`) are blocked at runtime.
2. **100% Local & Offline**: `RuleSync` operates 100% locally on your machine. It makes zero telemetry calls, zero network requests, and requires no API keys.
3. **Secret Redaction**: The static linter includes `no-secret-patterns` which scans rule files for API keys (`sk-ant-*`, `ghp_*`, `AKIA*`) and warns before they are committed or exported.
4. **Command Execution Safety**: The `no-unsafe-commands` linter flags rules containing destructive shell execution commands (`rm -rf /`, `chmod 777`, `curl | bash`).

## Reporting a Vulnerability

If you discover a potential security vulnerability in `RuleSync`, please **do not** create a public GitHub issue.

Instead, please report it privately via email to `security@rulesync.dev` or via GitHub Private Vulnerability Reporting.

Please include:
* Description of the vulnerability and potential impact.
* Steps to reproduce or proof-of-concept repository.
* Suggested fix or mitigation, if known.

You will receive an acknowledgment within 24 hours and regular updates on the resolution.
