const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { goals } = require('../server/db/schema');
const { eq } = require('drizzle-orm');

require('dotenv').config();

async function updateGoalTypes() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log('Updating goal types from "binary" to "gradual"...');
    
    const result = await db
      .update(goals)
      .set({ goalType: 'gradual' })
      .where(eq(goals.goalType, 'binary'));

    console.log('Goal types updated successfully!');
  } catch (error) {
    console.error('Error updating goal types:', error);
  } finally {
    await client.end();
  }
}

updateGoalTypes(); 