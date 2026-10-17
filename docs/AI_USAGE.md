# Use of AI in Part 1

The project brief asks teams to use an AI tool to specify the requirements, design the interface, write the frontend code, write the documentation, generate and run tests, and review the code. This page records how that was done.

## Tool

**Claude** (Anthropic), model Claude Opus 5.5, used through the claude.ai chat interface with its code-execution sandbox.

## Process

| Step | What the team did | What the AI produced |
|---|---|---|
| 1. Choose the asset type | Asked for options and chose **IT equipment** | Five options (IT equipment, vehicle fleet, projects, financial assets, software licences) with suggested fields and a recommendation |
| 2. Requirements | Confirmed scope from the course brief | `docs/REQUIREMENTS.md`: data model, 15 functional and 7 non-functional requirements, user stories |
| 3. Visual design | Left the visual style to the AI | Design concept based on the yellow asset label, colour and type tokens, layout, `docs/DESIGN.md` |
| 4. Code | Provided team names and IDs | The complete React + Vite project in `src/` |
| 5. Tests | — | 59 unit and integration tests. The AI **ran** them in its sandbox, found one bug, fixed it and re-ran them (see `docs/TEST_REPORT.md`) |
| 6. Visual check | — | The AI built the app, took screenshots in a headless browser, found a cramped table and misaligned filters, and fixed both |
| 7. Code review | — | Dependency audit and review covering security, performance, quality and reuse. The AI upgraded vulnerable packages and fixed the duplicated code it found (see `docs/CODE_REVIEW.md`) |
| 8. Documentation | — | `README.md` and all files in `docs/` |

## What the team checked

- The app runs locally with `npm install` and `npm run dev`.
- `npm test` passes on our own machine.
- Team names and student IDs on the About page are correct.

## Limitations noted

- The AI cannot push to GitHub. The team created the public repository and pushed the code.
- Sample people, serial numbers and costs are invented for demonstration.
