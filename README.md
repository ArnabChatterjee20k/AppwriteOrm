# About
Prisma style wrapper for `Backend as a Service` platforms to have a good developer experience while working with the appwrite and typescript. Mainly for appwrite.

# Demo

1. Install dependencies:
   ```sh
   pnpm install
   ```

2. Install the Appwrite CLI globally (if not already installed):
   ```sh
   pnpm add -g appwrite-cli
   ```

3. Log in to your Appwrite instance:
   ```sh
   appwrite login --endpoint "<YOUR_APPWRITE_ENDPOINT>"
   ```

4. Get your project details:
   ```sh
   appwrite projects get --project-id "<YOUR_PROJECT_ID>"
   ```

5. Update `appwrite.json`:
   - Change the `projectId` field in `appwrite.json` to your actual project ID after initializing the project.

6. Pull the Appwrite resources (collections, etc.):
   ```sh
   appwrite init project
   appwrite init collection
   # or use the appropriate pull command for your setup
   ```

7. Set up your `.env` file with the required variables (see `.env.example`).

8. Run the demo script:
   ```sh
   npx tsx demo.ts
   ```

# Todo

### Convention

- The ORM expects the models type as a TypeScript generic parameter (for type safety only). You do **not** pass the models object at runtime.
- At runtime, you only provide a mapping from your model names to collection/table IDs:
  ```ts
  const orm = ORM.init<typeof models>(adapter, {
    users: 'users',
    products: 'products',
    posts: 'posts',
    events: 'events',
  });
  ```
- This keeps your runtime code clean and type-safe, and allows you to flexibly map model names in your code to any Appwrite collection ID (including UUIDs or custom names).
- All type safety and code completion is powered by the generic type, not by passing the models object at runtime.

### Checklist

| Method       | Include in MVP   | Notes                         |
| ------------ | ---------------- | ----------------------------- |
| `findMany`   | ✅                | Filter, paginate, sort        |
| `findUnique` | ✅                | `id` only                     |
| `create`     | ✅                | Bulk insert (array of `data`) |
| `update`     | ✅                | Single item update by `where` |
| `delete`     | ✅                | `id` only                     |
| `upsert`     | ✅                |          |
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

# Usage

## Setup

Set the following environment variables in your environment (e.g., in a `.env` file or your shell):

```
APPWRITE_ENDPOINT=<your-appwrite-endpoint>
APPWRITE_PROJECT_ID=<your-appwrite-project-id>
APPWRITE_API_KEY=<your-appwrite-api-key>
```

## Example

```ts
import { Client, Permission, Role } from 'node-appwrite';
import { AppwriteAdapter } from './src/adapters/Appwrite';
import { ORM } from './src/orm/ORM';
import { models } from './Models';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const adapter = new AppwriteAdapter<typeof models>(client, 'auto-generated-db');

// Pass the models type as a generic, and only provide the collection mapping at runtime
const orm = ORM.init<typeof models>(adapter, {
  users: 'users',
  products: 'products',
  posts: 'posts',
  events: 'events',
});

async function showcaseUsersCollection() {
  // CREATE: Single and Multiple
  const [alice] = await orm.users.create([
    {
      $permissions: [Permission.read(Role.any()), Permission.create(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())],
      name: 'Alice',
      email: 'alice@example.com',
      age: 28,
      username: 'alice28',
      bio: 'Hello, I am Alice!',
    },
  ]);
  // ... more usage as in demo.ts ...
}

showcaseUsersCollection().catch(console.error);
```