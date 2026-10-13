# Corbett Water Report Template

Master template repository for Corbett Management Reports client-facing water report websites.

Approved production template version: **v1.1.0**.

Production template approval was granted on October 13, 2026.

## Branding and disclosures

This revision uses Corbett maroon and black for property identity and general report headings. Water-use charts, metrics and controls retain the Smart Water Management palette. Existing logo assets are preserved.

The footer contains three responsive disclosure cards:

- **Monthly summaries:** This report summarizes monthly irrigation usage and weather conditions. Rainfall timing and distribution can affect irrigation demand in ways monthly totals do not show.
- **Weather reference:** Weather conditions at your site may differ slightly from those recorded at the local weather station used in this analysis.
- **System conditions:** Reported irrigation usage may be affected by controller operation, system conditions, and meter or sensor performance. Contact your account manager with questions about your irrigation system.

This revision changes presentation and explanatory text. Reporting calculations, JSON schemas, TEST/FINAL behavior and supported features remain the same as v1.0.0.

## Purpose

This repository is the reusable blueprint for standalone account report websites. It contains shared HTML, CSS, JavaScript, branding assets and generic sample data.

The master demonstration intentionally retains generic TEST identity and reporting data. Template approval is separate from each account's numerical validation, QA and publication approval.

## Account websites and updates

Each management account uses one permanent, independent GitHub repository and GitHub Pages URL. Changing this master does not automatically update existing account websites.

Shared updates require an approved template revision, an account-specific replacement package that protects identity and reporting JSON, applicable QA, a human GitHub upload, and verification afterward. Quarterly data updates remain separate from shared-template changes.

## Public repository boundary

This master must contain only generic sample data. Do not upload client reporting data, workbooks, registry files, internal instructions, QA records, local previews, server helpers, backups or credentials.

## Release history

- **v1.0.0:** Original production release approved on October 12, 2026; baseline commit `b15b4819e9bda3e3071d4684ac7231392c756899`. Preserve its existing tag and release history.
- **v1.1.0:** Corbett identity colors and three footer disclosure cards. Release verification is recorded separately after publication.
