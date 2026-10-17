# Code review

**Scope:**
- All application code in `src/`: about 1,300 lines across 25 files.
- The configuration files.
- The dependency tree.

**Areas:** security, performance, code quality and code reuse.

**Method:**
- AI-assisted line-by-line review.
- An `npm audit` dependency scan.
- A search for unsafe patterns such as `dangerouslySetInnerHTML`, `eval` and `innerHTML`.
- The automated test suite.

**Severity scale:** High (must fix), Medium (should fix), Low (nice to have), Info (no action).

## Summary

| Area | Findings | Fixed | Open (planned) |
|---|---|---|---|
| Security | 8 | 1 fixed, 1 mitigated | 3 (two planned for Part 2) |
| Performance | 5 | 1 | 2 (low priority) |
| Code quality | 6 | 3 | 2 |
| Code reuse | 4 | 2 | 0 |

Findings marked "Info" confirm good practice and need no action.

---

## 1. Security

| # | Severity | Finding | Status |
|---|---|---|---|
| S1 | **High** | **Vulnerable dependencies.** The first version of `package.json` pinned `react-router-dom` 6.28.0, `vite` 5.4.11 and `vitest` 2.1.8. `npm audit` reported 9 advisories (3 critical, 4 high, 2 moderate). These included open-redirect issues in React Router and dev-server path-traversal issues in Vite and Vitest. | **Fixed.** Upgraded to React Router 7.18.4, Vite 8.3.2, Vitest 5.0.3 and plugin-react 6.1.1. `npm audit` now reports **0 vulnerabilities**. Each version chosen had been public for at least two weeks, to reduce the risk of a newly published malicious release. |
| S2 | Info | **Cross-site scripting (XSS).** All user text is rendered through JSX, which escapes it. There is no `dangerouslySetInnerHTML`, `innerHTML` or `eval` anywhere in `src/`. | No action |
| S3 | Info | **Input limits.** Text fields have `maxLength`, and validation repeats the limits (60 or 500 characters). Serial numbers only allow letters, digits and dashes. Dropdown values are checked against fixed lists, so tampered values are rejected. | No action |
| S4 | Info | **URL parameters.** The `q`, `category`, `status`, `sort` and `dir` parameters are only compared as strings and shown as escaped text. `dir` is whitelisted to `asc` or `desc`. An unknown `sort` field just sorts by an empty value, which is harmless. | No action |
| S5 | Low | **Third-party font request.** Google Fonts is loaded from `fonts.googleapis.com`, which shares visitors' IP addresses with Google and adds an external dependency. | Open. Recommend self-hosting the two fonts (for example with `@fontsource`) before production. |
| S6 | Medium | **No authentication or authorisation.** Anyone who opens the app can edit or delete data. This is acceptable for an in-memory Part 1 demo. | Open, planned for Part 2. Add login and role checks on the server. |
| S7 | Medium | **Validation is client-side only.** A malicious client could bypass it once a backend exists. | Open, planned for Part 2. The backend must repeat the rules in `validation.js`; the pure function can be shared. |
| S8 | **Low** | **Uncontrolled delete.** Deletion is a single action with no undo. | **Mitigated.** A confirmation dialog names the asset, and focus starts on **Cancel**, the safe choice. |

## 2. Performance

| # | Severity | Finding | Status |
|---|---|---|---|
| P1 | Low | **Dashboard recalculated on every render.** `summarizeAssets`, the attention list and the category sort ran on every render. | **Fixed.** They are wrapped in a single `useMemo` keyed on `assets`. |
| P2 | Info | The asset list's filter and sort are already memoised. The context value and all CRUD callbacks use `useMemo` and `useCallback`, so consumers do not re-render unnecessarily. | No action |
| P3 | Low | Search runs on every keystroke with no debounce. This is instant for hundreds of assets, but thousands would benefit from debouncing and pagination. | Open. Revisit in Part 2 with server-side search and pagination. |
| P4 | Low | **Bundle size** is 213 kB (69 kB gzipped) as a single chunk. Pages could be lazy-loaded with `React.lazy`. | Open. Not worthwhile at this size. |
| P5 | Info | `getAsset` uses `Array.find`, which is O(n). This is fine for an in-memory list, and the backend will look assets up by id. | No action |

## 3. Code quality

| # | Severity | Finding | Status |
|---|---|---|---|
| Q1 | **Medium** | **Bug: lower-case tags.** `it-0001` failed the format check instead of being normalised. The test suite found this. | **Fixed.** Tags are upper-cased in `normalizeAsset`, and a regression test was added. |
| Q2 | Low | **React Router future-flag warnings.** On v6 the console showed v7 migration warnings. | **Fixed** by upgrading to v7 (see S1). The obsolete flag code was removed, and the test output is now free of warnings. |
| Q3 | Low | **Untested paths.** The edit page's "asset not found" path and the Cancel button on the edit form had no tests. | **Fixed.** Two tests were added; the not-found markup is now shared (see R2). |
| Q4 | Low | **No linter or formatter.** There is no ESLint or Prettier configuration, so style is consistent only by convention. | Open. Recommend adding `eslint` with `eslint-plugin-react-hooks`, and Prettier. |
| Q5 | Low | **No static types.** The code relies on JSDoc comments rather than TypeScript or PropTypes. | Open. Consider TypeScript when the API types are defined in Part 2. |
| Q6 | Info | **Strengths:** business logic is in pure, tested functions; components are small and named after what they show; errors and empty states give clear next steps; accessibility is built in (labels, `aria-*`, focus handling). | No action |

## 4. Code reuse

| # | Severity | Finding | Status |
|---|---|---|---|
| R1 | Low | The status-to-colour map `STATUS_CLASS` was **duplicated** in `Badges.jsx` and `DashboardPage.jsx`. | **Fixed.** It is defined once in `data/constants.js`. |
| R2 | Low | The "Asset not found" markup was **duplicated** in the details and edit pages. | **Fixed.** It is extracted to `components/AssetNotFound.jsx`. |
| R3 | Info | **Shared building blocks already in place:**<br>- One `AssetForm` serves both add and edit.<br>- The `useDeleteAsset` hook and `DeleteAssetDialog` are shared by the list and details pages.<br>- `AssetTag`, `StatusBadge` and `WarrantyBadge` are used on every screen.<br>- A generic `ConfirmDialog` can be reused for any future destructive action. | No action |
| R4 | Info | The `utils/*` modules have no React dependency, so the same validation and query code can run on a Node backend in Part 2. | No action |

## 5. Verification after fixes

- `npm audit`: **0 vulnerabilities**
- `npm test`: **59/59 passed**
- `npm run build`: succeeds with no warnings
