import { Client, Models, Permission, Role, Users } from 'node-appwrite';
import { AppwriteAdapter } from './src/adapters/Appwrite';
import { ORM } from './src/orm/ORM';
import { models } from './Models';
import 'dotenv/config'

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const adapter = new AppwriteAdapter<typeof models>(client, process.env.DATABASE_ID!, {
  users: 'users',
  products: 'products',
  posts: 'posts',
  events: 'events',
});


const orm = ORM.init(adapter, models);

async function showcaseUsersCollection() {
  // CREATE: Single and Multiple
  const [alice] = await orm.users.create([
    {
      $permissions: [Permission.read(Role.any()),Permission.create(Role.any()),Permission.update(Role.any()),Permission.delete(Role.any())],
      name: 'Alice',
      email: 'alice@example.com',
      age: 28,
      username: 'alice28',
      bio: 'Hello, I am Alice!',
    },
  ]);
  const [bob] = await orm.users.create([
    {
      $permissions: [Permission.read(Role.any()),Permission.create(Role.any()),Permission.update(Role.any()),Permission.delete(Role.any())],
      name: 'Bob',
      email: 'bob@example.com',
      age: 32,
      username: 'bobby',
      bio: 'Bob here!',
    },
  ]);
  console.log('Created users:', alice, bob);

  // FIND UNIQUE: By username
  const foundByUsername = await orm.users.findUnique({ username: 'alice28' });
  console.log('Found by username:', foundByUsername);

  // FIND UNIQUE: By $id
  const foundById = await orm.users.findUnique({ $id: alice.$id });
  console.log('Found by $id:', foundById);

  // FIND MANY: All users
  const allUsers = await orm.users.findMany();
  console.log('All users:', allUsers);

  // FIND MANY: Where age >= 18
  const adults = await orm.users.findMany({ where: { age: { gte: 18 } } });
  console.log('Adult users:', adults);

  // FIND MANY: Where name in list
  const namedUsers = await orm.users.findMany({ where: { name: { in: ['Alice', 'Bob'] } } });
  console.log('Users named Alice or Bob:', namedUsers);

  // FIND MANY: Where bio contains substring
  const bioContains = await orm.users.findMany({ where: { name: { equals: 'Alice' } } });
  console.log('Users with \"Alice\" in bio:', bioContains);

  // FIND MANY: With orderBy, skip, take
  const pagedUsers = await orm.users.findMany({
    orderBy: { age: 'desc' },
    skip: 0,
    take: 1,
  });
  console.log('Paged users (oldest first, 1 result):', pagedUsers);

  const upserted = await orm.users.upsert({ $id: alice.$id, name: 'Alice changed'})
  const upsertedAlice = await orm.users.findUnique({$id: alice.$id})
  console.log({upsertedAlice})

  // UPDATE: By $id
  if (alice) {
    const updated = await orm.users.update({ $id: alice.$id }, { bio: 'Updated bio for Alice!' });
    console.log('Updated Alice:', updated);
  }

  // DELETE: By $id
  if (bob) {
    await orm.users.delete({ $id: bob.$id });
    console.log('Deleted Bob with id:', bob.$id);
  }
}

showcaseUsersCollection().catch(console.error);