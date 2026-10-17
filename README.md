# AssetDesk: IT equipment inventory

AssetDesk is a React web app for managing a company's IT equipment: laptops, desktops, monitors, printers, phones, tablets, servers and network devices. It records who each device is assigned to, where it is, what it cost and when its warranty ends.

This is **Part 1** of the SE411 project (Fall 2026–27). The frontend is built with React. Data is held **in memory as a collection of objects**, with no database; a backend follows in Part 2.

![Dashboard](docs/screenshots/dashboard.png)

## Team

| Name | Student ID |
|---|---|
| Omar Moustafa Aleraky | 223211469 |
| Khaled Samer Abdou | 223110669 |
| Ahmed Sabbah Quraiba | 220110509 |

## Features

- **Dashboard:** total assets and value, items that need attention (under repair or warranty ending within 90 days), and breakdowns by status and category that link to filtered lists.
- **Display:** a sortable table of all assets, plus a details page for each one.
- **Search:** free-text search across tag, brand, model, serial number, person, department, location and category, combined with category and status filters.
- **Add:** a validated form that suggests the next free asset tag.
- **Update:** the same form, pre-filled, for editing an existing asset.
- **Delete:** with a confirmation dialog, from the list or the details page.
- **Menu** to move between Dashboard, Assets, Add asset and About.
- **About page** listing the team members and their student IDs.

Full details are in [docs/FEATURES.md](docs/FEATURES.md).

## Getting started

You need **Node.js 20 or newer**; the project was checked with Node 22 and 24.

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the app at http://localhost:5173
```

Other commands:

```bash
npm test               # run all tests once
npm run test:coverage  # run tests with a coverage report
npm run build          # production build into dist/
npm run preview        # serve the production build
```

## Tech stack

React 18 · React Router 7 · Vite 8 · Vitest 5 · React Testing Library · plain CSS. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Project structure

```
src/
  App.jsx               routes + providers
  main.jsx              entry point (BrowserRouter)
  styles.css            all styling and design tokens
  components/           reusable UI (Layout, AssetForm, AssetTag, badges, dialogs)
  context/              AssetContext (data + CRUD), ToastContext (messages)
  data/                 seed assets, option lists, team members
  pages/                one component per screen
  utils/                pure logic: reducer, validation, search/sort, formatting
  test/                 integration tests and test helpers
docs/                   requirements, design, architecture, features, tests, code review, AI usage
```

## Documentation

| Document | Contents |
|---|---|
| [Requirements](docs/REQUIREMENTS.md) | Functional and non-functional requirements, data model, user stories |
| [Visual design](docs/DESIGN.md) | Design tokens, typography, layout, screens, accessibility |
| [Architecture](docs/ARCHITECTURE.md) | Tech stack, component structure, data flow, plan for Part 2 |
| [Features](docs/FEATURES.md) | What each screen does and how to use it |
| [Test report](docs/TEST_REPORT.md) | Test strategy, test list, results and coverage |
| [Code review](docs/CODE_REVIEW.md) | Security, performance, quality and reuse review, with fixes |
| [AI usage](docs/AI_USAGE.md) | How the AI tool was used in this part |

## Notes

- Changes are kept in memory only, so reloading the page restores the 15 sample assets. This is expected for Part 1.
- Sample people and serial numbers are fictional.
