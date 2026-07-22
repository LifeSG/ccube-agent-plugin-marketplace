import { sql } from './client.js';

export async function seedIfEmpty(): Promise<void> {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM items`;
  if (count > 0) return;

  await sql`
    INSERT INTO items (title) VALUES
      ('Sample item 1'),
      ('Sample item 2'),
      ('Sample item 3')
  `;
  console.log('Seeded 3 sample items');
}
