# Project plan: Mailroom

## Brief

**Type:** Marketing and SEO tool

**Problem:** A simple email report should show the math behind its headline rates.

**Audience:** A lifecycle marketer exploring a campaign CSV export.

## Experience flow

1. Arrive at a direct, descriptive introduction.
2. Review the sample interface and its scope before interacting.
3. Try the core control: Analyze campaign CSV rates in the browser.
4. See a local result or demonstration state without sending a request to a service.

## Interaction

A local CSV parser aggregates sent, opens, clicks, conversions and revenue, shows explicit rate formulas and exports a report.

## Key design decision

Process the chosen file with FileReader in the browser and surface malformed rows instead of silently fabricating results.

## Boundaries

Email provider definitions differ; delivered/open/click denominators must be checked against the source export. Open tracking is imperfect.

The tool is intentionally transparent about its input, assumptions and limits. It is a front-end educational prototype, not a substitute for platform data, professional review or controlled measurement.

## Next iteration

Add configurable column mapping and document treatment of bounces, duplicates and missing values.

## Learning goals

- Structure a complete page with meaningful headings, landmarks and labelled controls.
- Separate visual rules in CSS from interaction logic in JavaScript.
- Make states understandable with keyboard controls and live status text.
- Document assumptions and the boundary between a helpful prototype and a production service.
