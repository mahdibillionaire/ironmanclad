# WebEngine

Autonomous, high-performance web automation and headless pipeline runner.

## Overview
WebEngine provides a robust container and CI/CD workflow to execute scheduled headless browser tasks, CAPTCHA mitigation, and data synchronization.

## Architecture
- **Runtime Environment:** Playwright Headless Chromium + Node.js 20 + Python 3.
- **Stealth & Reliability:** Advanced anti-detection hooks and session persistence.
- **Privacy Layer:** Built-in sanitization engine ([`agents/Sanitizer.ts`](agents/Sanitizer.ts)) that masks all PII in runner logs.
- **Cloud Payload Synchronization:** Powered by `rclone` to dynamically pull and persist private workflow state from Google Drive without exposing secrets in source control.

## Setup & Secrets
To enable automated execution in GitHub Actions, configure the following secrets in **Settings > Secrets and variables > Actions**:

| Secret Name | Description | Required |
|---|---|---|
| `RCLONE_CONFIG_DATA` | Raw contents of your `rclone.conf` with Google Drive token | **Yes** |
| `GDRIVE_PATH` | Path to your payload on Google Drive (defaults to `gdrive:pmu-engine`) | Optional |

## Execution Schedule
The engine runs automatically 5 times daily on weekdays during peak US business hours:
- `13:00 UTC` (09:00 AM EDT / 06:00 AM PDT)
- `16:00 UTC` (12:00 PM EDT / 09:00 AM PDT)
- `18:00 UTC` (02:00 PM EDT / 11:00 AM PDT)
- `20:00 UTC` (04:00 PM EDT / 01:00 PM PDT)
- `22:00 UTC` (06:00 PM EDT / 03:00 PM PDT)

Manual executions can be triggered anytime via the **Actions** tab with custom search queries and target limits.
