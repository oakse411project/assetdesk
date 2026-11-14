# Architecture and technology stack

AssetDesk has two parts that talk over HTTP/JSON:

- a **React frontend** (Part 1), served by Vite on port 5173
- a **Java Spring server** (Part 2) on port 3001, storing data in an H2 database

## 1. Overall architecture

```
 ┌──────────────────────────── Browser ────────────────────────────┐
 │  React app (Vite, http://localhost:5173)                        │
 │                                                                 │
 │   Pages (Dashboard, Assets, Add, Details, Edit, About)          │
 │        │  useAssets() / useAsset(id)                            │
 │        ▼                                                        │
 │   AssetContext  ── holds the loaded assets, add/update/delete   │
 │        │                                                        │
 │        ▼                                                        │
 │   api/assetApi.js  ── fetch() calls, errors → ApiError          │
 └────────┼────────────────────────────────────────────────────────┘
          │  HTTP + JSON   GET / POST / PUT / DELETE /api/v1/assets
          ▼
 ┌──────────────── Spring Boot server (http://localhost:3001) ─────┐
 │                                                                 │
 │   AssetController   @RestController  /api/v1/assets             │
 │     - maps routes, validates input (@Valid, @Positive, @Min)    │
 │     - turns results/exceptions into status codes                │
 │        │                                                        │
 │        ▼                                                        │
 │   AssetService      @Service                                    │
 │     - paging and sorting, duplicate checks                      │
 │     - throws ObjectNotFoundException / DuplicateAssetException  │
 │        │                                                        │
 │        ▼                                                        │
 │   AssetRepository   CrudRepository + PagingAndSortingRepository │
 │        │            (Spring Data JDBC)                          │
 │        ▼                                                        │
 │   H2 in-memory database   schema.sql + data.sql (15 assets)     │
 └─────────────────────────────────────────────────────────────────┘
```

The REST routes are listed in [API.md](API.md).

## 2. Technology stack

### Backend (`backend/`)

| Layer | Technology | Version |
|---|---|---|
| Language | Java | 21 |
| Framework | Spring Boot (`spring-boot-starter-webmvc`) | 4.1.2 |
| Data access | Spring Data JDBC (`spring-boot-starter-data-jdbc`) | from Boot 4.1.2 |
| Database | H2, in memory, created from `schema.sql` and filled from `data.sql` | from Boot 4.1.2 |
| Validation | Jakarta Bean Validation (`spring-boot-starter-validation`) | from Boot 4.1.2 |
| Tests | JUnit 5, Mockito, Spring MockMvc (`spring-boot-starter-webmvc-test`) | from Boot 4.1.2 |
| Build | Maven (wrapper included: `mvnw`) | – |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| UI library | React | 18.3.1 |
| Routing | React Router (`react-router-dom`) | 7.18.4 |
| Build tool / dev server | Vite | 8.3.2 |
| HTTP | `fetch` (built into the browser) | – |
| State | React Context | built in |
| Tests | Vitest + React Testing Library + jsdom | 5.0.3 / 16.1.0 |

## 3. Backend structure

```
backend/src/main/java/edu/psu/se411/assetdesk/
  AssetdeskApplication.java        @SpringBootApplication entry point
  model/Asset.java                 Java record + validation annotations
  repository/AssetRepository.java  CrudRepository + PagingAndSortingRepository,
                                   plus existsBy... queries for duplicates
  service/AssetService.java        business logic
  controller/AssetController.java  REST routes
  exception/ObjectNotFoundException.java
  exception/DuplicateAssetException.java
backend/src/main/resources/
  application.properties           server.port=3001
  schema.sql                       CREATE TABLE asset (...)
  data.sql                         the 15 sample assets
```

The layering follows the course labs: the controller only talks to the service, the service only talks to the repository, and each class receives what it needs through its constructor.

| Request | Controller | Service | Repository |
|---|---|---|---|
| GET all (paged) | `getAllAssets(page, size, sort, dir)` | `getAllAssets(...)` builds a `PageRequest` | `findAll(Pageable)` |
| GET by id | `getAssetById(id)` | `getAssetById(id)` | `findById(id)` |
| POST | `createAsset(asset, ucb)` | `createAsset(asset)` | `existsByAssetTag`, `existsBySerialNumber`, `save` |
| PUT | `updateAsset(id, asset)` | `updateAsset(id, asset)` | `findById`, `existsBy...AndIdNot`, `save` |
| DELETE | `deleteAsset(id)` | `deleteAsset(id)` | `findById`, `deleteById` |

Errors are handled the same way as in the labs:

- The service throws `ObjectNotFoundException` or `DuplicateAssetException`.
- The controller catches them and returns **404** or **409**.
- Invalid bodies and parameters are rejected with **400** by `@Valid` and the constraint annotations.

## 4. Frontend structure

```
src/
  api/assetApi.js        REST client: getAssetPage, getAllAssets, getAssetById,
                         createAsset, updateAsset, deleteAsset
  context/AssetContext   loads all assets from the server; add/update/delete call the API, then reload
  components/useAsset    loads one asset by id (details and edit pages)
  components/LoadState   "Loading…" and "Cannot reach the server" screens
  pages/                 one component per screen
  utils/                 validation, search/sort, dashboard summary, formatting (unchanged from Part 1)
  test/                  UI tests, fake in-memory API, test data
```

### Data flow

```
 user clicks "Add asset"
   → AddAssetPage → useAssets().addAsset(values)
   → assetApi.createAsset → POST /api/v1/assets → 201 + Location: /api/v1/assets/16
   → AssetContext reloads the list → page navigates to /assets/16
   → AssetDetailsPage → useAsset(16) → GET /api/v1/assets/16 → shows the asset
```

### Pagination and search

- **Asset list without filters:** the server does the paging. The page asks for `GET /api/v1/assets?page=N&size=10&sort=…&dir=…` and shows Previous/Next buttons. The page number is kept in the URL (`/assets?page=2`).
- **With a search or a filter** (free text, category, status): the list searches the full collection already loaded by `AssetContext`, then splits the results into pages of 10 the same way. This keeps the Part 1 search unchanged.
- **Find by ID:** the box on the Assets page opens `/assets/{id}`, which calls `GET /api/v1/assets/{id}`.

### Frontend routes

| Path | Screen | API calls |
|---|---|---|
| `/` | Dashboard | GET all (one large page) |
| `/assets` | Asset list (`?page=`, `?q=`, `?category=`, `?status=`, `?sort=`, `?dir=`) | GET page |
| `/assets/new` | Add asset | POST |
| `/assets/:id` | Asset details | GET by id, DELETE |
| `/assets/:id/edit` | Edit asset | GET by id, PUT |
| `/about` | About and team | – |

## 5. Key design decisions

| Decision | Reason |
|---|---|
| Lab 14 layering (controller → service → repository) and status codes (201 + Location, 204, 404) | Matches the course's REST conventions |
| Validation on both sides | The client gives instant feedback; the server is the real guard (Bean Validation + duplicate checks + `UNIQUE` columns) |
| The request body must not contain an `id` | The id comes from the database (POST) or the URL (PUT), as in Lab 14 |
| Whitelist of sort fields | A bad `sort` value returns 400 instead of a database error |
| `@CrossOrigin` limited to `http://localhost:5173` | Only the React dev server may call the API from a browser |
| `PagedModel` for the page response | Spring Data's stable JSON format for pages (`content` + `page`) |
| Frontend `api` object injectable into `AssetProvider` | UI tests run against an in-memory fake with the same behaviour as the server |
| H2 in-memory database | No installation needed. Data resets on every server restart, so demos always start from the 15 sample assets |
