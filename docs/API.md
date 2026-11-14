# REST API (Part 2)

The Spring server runs on **http://localhost:3001**. Every route is under `/api/v1/assets` and uses JSON.

## Routes

| Method | Route | Description | Request body | Responses |
|---|---|---|---|---|
| GET | `/api/v1/assets` | Get all assets, one page at a time. Optional query parameters: `page` (from 0, default 0), `size` (1–1000, default 10), `sort` (`id`, `assetTag`, `brand`, `assignedTo`, `status`, `warrantyExpiry`; default `assetTag`), `dir` (`asc` or `desc`, default `asc`) | – | **200 OK** + a page of assets · **400 Bad Request** for an invalid page, size or sort field |
| GET | `/api/v1/assets/{id}` | Search for one asset by its id | – | **200 OK** + the asset · **404 Not Found** · **400 Bad Request** if the id is not positive |
| POST | `/api/v1/assets` | Add a new asset | Asset JSON **without** an `id` | **201 Created** with a `Location` header pointing to the new asset, empty body · **400 Bad Request** if the body has an `id` or fails validation · **409 Conflict** if the tag or serial number is already used |
| PUT | `/api/v1/assets/{id}` | Update an existing asset | Asset JSON **without** an `id` | **204 No Content** · **400 Bad Request** if the body has an `id` or fails validation · **404 Not Found** · **409 Conflict** if the tag or serial number belongs to another asset |
| DELETE | `/api/v1/assets/{id}` | Delete an asset | – | **204 No Content** · **404 Not Found** |

The controller allows cross-origin requests from the React dev server (`http://localhost:5173`) and exposes the `Location` header so the frontend can read the id of a newly created asset.

## Asset JSON

```json
{
  "id": 8,
  "assetTag": "IT-0008",
  "category": "Server",
  "brand": "Dell",
  "model": "PowerEdge R760",
  "serialNumber": "PER760-0093X",
  "assignedTo": "",
  "department": "IT",
  "location": "Server room B",
  "purchaseDate": "2024-01-22",
  "purchaseCost": 48500.00,
  "warrantyExpiry": "2029-01-22",
  "status": "In use",
  "notes": "Hosts internal file shares."
}
```

Validation (Bean Validation annotations on the `Asset` record):

| Field | Rule |
|---|---|
| `assetTag` | required, format `IT-0001` (IT- followed by 4 or more digits), unique |
| `category`, `department`, `status` | required |
| `brand`, `model` | required, at most 60 characters |
| `serialNumber` | required, letters, numbers and dashes only, unique |
| `assignedTo`, `location` | optional, at most 60 characters |
| `purchaseDate`, `warrantyExpiry` | required, `YYYY-MM-DD` |
| `purchaseCost` | required, 0 or more |
| `notes` | optional, at most 500 characters |

## Paginated response

`GET /api/v1/assets?page=1&size=10`

```json
{
  "content": [ { "id": 11, "assetTag": "IT-0011", "...": "..." } ],
  "page": { "size": 10, "number": 1, "totalElements": 15, "totalPages": 2 }
}
```

## Examples

```bash
curl "http://localhost:3001/api/v1/assets?page=0&size=5&sort=brand&dir=desc"
curl http://localhost:3001/api/v1/assets/8
curl -i -X POST http://localhost:3001/api/v1/assets -H "Content-Type: application/json" \
  -d '{"assetTag":"IT-0016","category":"Laptop","brand":"Lenovo","model":"ThinkPad T14","serialNumber":"PF-NEW-001","assignedTo":"","department":"Finance","location":"","purchaseDate":"2026-10-01","purchaseCost":5200,"warrantyExpiry":"2029-10-01","status":"In storage","notes":""}'
curl -i -X DELETE http://localhost:3001/api/v1/assets/16
```
