# About
Prisma style wrapper for `Backend as a Service` platforms to have a good developer experience while working with the appwrite and typescript. Mainly for appwrite.

# Todo

### Convention
```
```

### Checklist

| Method       | Include in MVP   | Notes                         |
| ------------ | ---------------- | ----------------------------- |
| `findMany`   | ✅                | Filter, paginate, sort        |
| `findUnique` | ✅                | `id` only                     |
| `create`     | ✅                | Bulk insert (array of `data`) |
| `update`     | ✅                | Single item update by `where` |
| `delete`     | ✅                | `id` only                     |
| `upsert`     | ❌                | Skip for now                  |
| `createMany` | ✅ (via `create`) | Combined                      |
| `updateMany` | ❌                | Skip for now                  |
| `deleteMany` | ❌                | Skip for now                  |
| `count`      | ❌                | Skip for now                  |

### Where clause support

| Operator     | Format                           | Appwrite Equivalent                |
| ------------ | -------------------------------- | ---------------------------------- |
| `equals`     | `{ field: { equals: val } }`     | `Query.equal(field, [val])`        |
| `not`        | `{ field: { not: val } }`        | `Query.notEqual(field, [val])`     |
| `in`         | `{ field: { in: [a, b] } }`      | `Query.equal(field, [a, b])`       |
| `contains`   | `{ field: { contains: str } }`   | `Query.search(field, str)`         |
| `lt` / `lte` | `{ field: { lt: n } }`           | `Query.lessThan(field, n)`         |
| `gt` / `gte` | `{ field: { gte: n } }`          | `Query.greaterThanEqual(field, n)` |

### Validation on the wrapper level before sending to the server
-> Generating zod validators from the provided type/model