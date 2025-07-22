import { Client, Models, Permission, Role, Users } from 'node-appwrite';
import { AppwriteAdapter } from './src/adapters/Appwrite';
import { ORM } from './src/orm/ORM';
import { models } from './Models';

const client = new Client()
  .setEndpoint('http://localhost:8080/v1')
  .setProject('687f503d0008a2867da4')
  .setKey('standard_1b6a4caaadb45eb7ef949fa4f48454be132f9649d9a085155050be7a92c8b8232cc7e28d9b08c4516b006df2ac529e75830011c8152058f2e2d5d8a2985a6e48e97ff3d169cd3154896c8dcb0ae2cdc16f43968264a3d476d95d4e9d91c68f7aa93a228fa06ae98c071763f89d5e7a9cb42264d6b5dde731e8b627383bd52be0');

const adapter = new AppwriteAdapter<typeof models>(client, 'auto-generated-db', {
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