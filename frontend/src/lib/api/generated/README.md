# Generated API types

This directory is reserved for TypeScript types generated from the backend
OpenAPI schema.

Planned workflow once the FastAPI service exists:

```bash
# 1. Export the schema from the backend
curl http://localhost:8000/openapi.json -o openapi.json

# 2. Generate types into src/lib/api/generated/schema.d.ts
pnpm dlx openapi-typescript ./openapi.json -o src/lib/api/generated/schema.d.ts
```

Rules:

- Generated files are **not** edited by hand.
- Domain types used by components live next to their feature
  (`src/features/<feature>/types.ts`).
- The API functions in `server.ts` / `client.ts` map generated DTOs onto those
  domain types, so components never depend on raw HTTP shapes.
- `src/features/*/api.ts` always reads tasks and articles from the backend in
  normal operation (`http://localhost:8000` by default in `next dev`). Local
  fixtures are only a fallback for builds without a configured API origin.
