# Architecture and technology stack

## 1. Technology stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| UI library | React | 18.3.1 | Required by the project; component model and hooks |
| Routing | React Router (`react-router-dom`) | 7.18.4 | Menu navigation, URL per screen, filters kept in the URL |
| Build tool / dev server | Vite | 8.3.2 | Fast dev server and production build |
| State | React Context + `useReducer` | built in | Enough for one shared collection; no extra library needed |
| Styling | Plain CSS with custom properties | – | One stylesheet with design tokens; no CSS framework |
| Unit / integration tests | Vitest + React Testing Library + jsdom | 5.0.3 / 16.1.0 | Fast tests that use the same config as Vite |
| User simulation | `@testing-library/user-event` | 14.5.2 | Realistic typing and clicking in tests |
| Coverage | `@vitest/coverage-v8` | 5.0.3 | Coverage report |
| Runtime | Node.js | 20+ (checked on 22 and 24) | Runs the tooling |

All dependency versions are pinned exactly. `npm audit` reports **0 vulnerabilities** (see the [code review](CODE_REVIEW.md)).

## 2. High-level structure

```
                        main.jsx
                           |
                     <BrowserRouter>
                           |
                         App.jsx
                           |
                    <ToastProvider>        messages ("Added IT-0016")
                           |
                    <AssetProvider>        asset collection + CRUD functions
                           |
                       <AppRoutes>
                           |
                        <Layout>           sidebar menu + <Outlet>
                           |
   +-----------+-----------+-----------+-----------+-----------+
   |           |           |           |           |           |
Dashboard   Assets     AddAsset   AssetDetails EditAsset    About
   |           |           |           |           |
   |           |           +-----+-----+-----+-----+
   |           |                 |           |
   |           |            <AssetForm>  useDeleteAsset + <DeleteAssetDialog>
   |           |
   +-----------+---- shared: <AssetTag>, <StatusBadge>, <WarrantyBadge>

   Pure logic (no React):  utils/assetReducer.js   utils/validation.js
                           utils/assetQueries.js   utils/format.js
   Static data:            data/seedAssets.js  data/constants.js  data/team.js
```

## 3. Routes

| Path | Screen |
|---|---|
| `/` | Dashboard |
| `/assets` | Asset list. Accepts `?q=`, `?category=`, `?status=`, `?sort=` and `?dir=` |
| `/assets/new` | Add asset |
| `/assets/:id` | Asset details |
| `/assets/:id/edit` | Edit asset |
| `/about` | About and team |
| `*` | Page not found |

Search and filter values are stored in the URL. This lets dashboard links open a pre-filtered list, and the browser Back button restores the previous search.

## 4. Data flow

```
 user action ──► page component ──► useAssets().addAsset / updateAsset / deleteAsset
                                             │
                                             ▼
                                 dispatch({ type, payload })
                                             │
                                             ▼
                           assetReducer(state, action) → new array
                                             │
                                             ▼
                   React re-renders every component that uses useAssets()
```

1. **The collection** is an array of plain objects, initialised from `data/seedAssets.js`. This is the "collection of objects" required for Part 1.
2. **`AssetContext`** wraps the array in `useReducer` and exposes:
   - `assets`
   - `addAsset(values)`
   - `updateAsset(id, values)`
   - `deleteAsset(id)`
   - `getAsset(id)`
3. **`assetReducer`** is a pure function that returns a new array for `ADD_ASSET`, `UPDATE_ASSET` and `DELETE_ASSET`. It never mutates state.
4. **Validation** (`validateAsset`) runs in the form before anything is saved. It checks the current collection to keep tags and serial numbers unique.
5. **Search, filter, sort and dashboard summaries** (`assetQueries.js`) are pure functions of the collection. Pages call them inside `useMemo` or on render.

## 5. Key design decisions

| Decision | Reason |
|---|---|
| Context + reducer instead of Redux or Zustand | One collection and three operations do not justify an extra library |
| Business logic kept out of components | Easy to unit-test, and Part 2 can reuse validation and queries unchanged |
| One `AssetForm` for both add and edit | Avoids duplicating fields and validation |
| `useDeleteAsset` hook + `DeleteAssetDialog` | The same confirm-then-delete flow is shared by the list and the details page |
| `AssetProvider` accepts `initialAssets` | Each test starts from known data |
| Router added in `main.jsx`, not in `App` | Tests wrap `App` in a `MemoryRouter` at any URL |
| Plain CSS with tokens | The design is small and specific, so a framework would add weight without benefit |

## 6. Moving to Part 2 (backend)

Only `AssetContext.jsx` needs to change:

- Load the initial list with `fetch('/api/assets')` instead of the seed file.
- Make `addAsset`, `updateAsset` and `deleteAsset` call `POST`, `PUT` and `DELETE` endpoints, then dispatch the same reducer actions with the server's response.
- Keep `validateAsset` on the client for instant feedback, and repeat the same rules on the server.
- Pages, components, the reducer and the query functions can stay as they are.
