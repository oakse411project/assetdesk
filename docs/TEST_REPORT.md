# Test report

**Date run:** 17 October 2026
**Command:** `npm run test:coverage`
**Result:** ✅ **59 of 59 tests passed** in 8 test files.

## 1. Tools

| Tool | Role |
|---|---|
| Vitest 5.0.3 | Test runner and assertions; shares Vite's configuration |
| React Testing Library 16.1.0 | Renders components and finds elements the way a user would (by role and label) |
| @testing-library/user-event 14.5.2 | Simulates real typing, clicking, selecting and key presses |
| jsdom 25.0.1 | Browser-like environment in Node |
| @vitest/coverage-v8 5.0.3 | Coverage measurement |

## 2. Strategy

- **Unit tests** check the pure logic in `src/utils`: the reducer, validation, search, sort, warranty calculations and dashboard summaries.
- **Integration tests** in `src/test` render the **whole app** inside a `MemoryRouter` at a chosen URL with fresh sample data. They then act as a user would: clicking menu links, typing in the search box, filling in forms and confirming dialogs.
- Tests find elements by accessible role and label (for example `getByRole('button', { name: 'Delete IT-0005' })`). This also checks that the interface is accessible.
- Date-dependent unit tests use a fixed "today" (17 Oct 2026) so they never go out of date.

## 3. Test list

### Unit tests

| File | Tests | What is checked |
|---|---|---|
| `utils/assetReducer.test.js` | 7 | Add, update and delete without mutating state; unknown action; next-tag generation; unique ids |
| `utils/validation.test.js` | 12 | Valid asset; required fields; tag format; duplicate tag or serial (case-insensitive); editing keeps own tag; "In use" needs a person; warranty after purchase; invalid dates and costs; unknown category and length limits; serial character set; trimming; upper-casing tags |
| `utils/assetQueries.test.js` | 12 | Search on any field; multi-word search; combined filters; no matches; string and number sorting; days-until and warranty state; dashboard counts, value and expiring list |

### Integration tests

| File | Tests | What is checked |
|---|---|---|
| `test/navigation.test.jsx` | 4 | All menu items present; navigating to each page; active menu item; not-found page |
| `test/about.test.jsx` | 1 | Every team member's name and student ID is shown |
| `test/dashboard.test.jsx` | 3 | Summary text; status link opens the filtered list; empty inventory |
| `test/assetsList.test.jsx` | 9 | Displays all assets; live search; category and status filters; filters from the URL; empty state and clear filters; column sorting; delete with confirmation; cancel delete; close dialog with Escape |
| `test/assetForm.test.jsx` | 11 | Suggested tag; empty form shows errors and focuses the first field; add a valid asset (then it appears in the list); duplicate serial rejected; "In use" needs a person and the error clears when fixed; details page; update an asset; delete from the details page; unknown id on details and edit pages; cancel an edit |

### Requirement coverage

| Requirement | Tests |
|---|---|
| FR-2 Menu | navigation (4) |
| FR-3/FR-4 Display | assetsList "displays all", assetForm "shows the asset details" |
| FR-5 Add | assetForm "adds a valid asset…", "suggests the next free tag" |
| FR-6 Update | assetForm "updates an asset", "cancelling an edit…" |
| FR-7 Delete | assetsList delete (3), assetForm "deletes from the details page" |
| FR-8/FR-9 Search and filter | assetsList (5), assetQueries filterAssets (5) |
| FR-10 Sort | assetsList "sorts…", assetQueries sortAssets (2) |
| FR-11 Validation | validation (12), assetForm error tests (3) |
| FR-12 Dashboard | dashboard (3), assetQueries summarizeAssets (3) |
| FR-13 About | about (1) |
| FR-15 Not found | navigation "not-found", assetForm unknown id (2) |

## 4. Results

```
 ✓ src/test/assetForm.test.jsx      (11 tests)
 ✓ src/test/assetsList.test.jsx     (9 tests)
 ✓ src/test/navigation.test.jsx     (4 tests)
 ✓ src/test/dashboard.test.jsx      (3 tests)
 ✓ src/test/about.test.jsx          (1 test)
 ✓ src/utils/assetQueries.test.js   (12 tests)
 ✓ src/utils/validation.test.js     (12 tests)
 ✓ src/utils/assetReducer.test.js   (7 tests)

 Test Files  8 passed (8)
      Tests  59 passed (59)
```

### Coverage (application code; tests excluded)

| Statements | Branches | Functions | Lines |
|---|---|---|---|
| 93.9 % | 89.6 % | 93.1 % | 96.4 % |

The uncovered lines are mostly defensive branches, such as the fallback id generator used when `crypto.randomUUID` is unavailable, the toast close button, and the mobile menu toggle.

## 5. Defects found by testing

| # | Found by | Problem | Fix |
|---|---|---|---|
| 1 | `validation.test.js`, duplicate tag test | A tag typed in lower case (`it-0001`) was rejected as "wrong format" instead of being accepted and checked for duplicates | `normalizeAsset` now upper-cases the tag before validation and storage; a test was added for this |

After the fix, all tests passed.

## 6. How to run

```bash
npm test               # run once
npm run test:watch     # re-run on every file change
npm run test:coverage  # with coverage table (HTML report in coverage/)
```

---

# Part 2: backend and integration tests

## Backend (JUnit 5 + Mockito), `cd backend && ./mvnw test`

| Test class | Kind | What it covers | Tests |
|---|---|---|---|
| `service/AssetServiceTest` | Unit test, `@ExtendWith(MockitoExtension.class)` with `@Mock AssetRepository` and `@InjectMocks AssetService` | Paging and sorting parameters, unknown sort field, find by id (found / not found), create (saved / duplicate tag / duplicate serial), update (saved with same id / not found / duplicate tag / duplicate serial), delete (deleted / not found) | 14 |
| `controller/AssetControllerTest` | Web-layer test, `@WebMvcTest` + `MockMvc` + `@MockitoBean AssetService` | Every route and status code: 200 page JSON, paging params, 400 bad sort / size / id, 200/404 by id, 201 + Location, 400 body with id, 400 invalid data, 409 duplicate, 204/404/409 update, 204/404 delete, CORS headers | 19 |
| `AssetApiIntegrationTest` | `@SpringBootTest` + `MockMvc` against the real H2 database (fresh for each test) | Paging over the seeded data, sorting, find by id, add then read back from `Location`, duplicate → 409, update then read back, update unknown → 404, delete then 404 | 8 |
| `AssetdeskApplicationTests` | `@SpringBootTest` | Application context starts | 1 |

Result: **42 tests, 0 failures**.

## Frontend (Vitest), `npm test`

The UI tests now run against `src/test/fakeApi.js`, an in-memory copy of the server's behaviour (paging, 404, 409). They check that each screen sends the right API call:

- the list asks for `page`/`size`/`sort`/`dir`
- the add form sends a body without an `id`
- the edit page sends `PUT` for the right id
- delete sends `DELETE`

`src/api/assetApi.test.js` tests the HTTP client itself with a mocked `fetch`: URLs, methods, reading the new id from `Location`, and error handling.

Result: **67 tests, 0 failures**.

## Manual end-to-end check

The two apps were run together: Spring on port 3001 and Vite on port 5173. In the browser:

- The list loaded 15 assets from the server and moved to page 2.
- A new asset was added; the page opened at the id the server returned.
- The location was edited and saved.
- The asset was deleted.

The browser console showed no errors.
