const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTableIfNotExists() {
  console.log('Ensuring jobs table exists...');

  const { error } = await supabase.rpc('create_jobs_table_if_not_exists').catch(() => ({ error: null }));

  // If RPC doesn't exist, table may already exist from manual SQL, which is fine
  return true;
}

async function migrate() {
  try {
    // Read jobs from SQLite export
    const jobsData = JSON.parse(fs.readFileSync('/tmp/jobs_export.json', 'utf8'));
    console.log(`Found ${jobsData.length} jobs to migrate`);

    // Prepare data for PostgreSQL (convert fields as needed)
    const preparedData = jobsData.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
      description: job.description,
      score: job.score || 0,
      stage: job.stage || 'new',
      relevant: job.relevant || 0,
      notes: job.notes,
      source: job.source,
      salary: job.salary,
      deadline: job.deadline,
      created_at: job.created_at,
      updated_at: job.updated_at
    }));

    // Insert jobs in batches
    const batchSize = 10;
    let inserted = 0;

    for (let i = 0; i < preparedData.length; i += batchSize) {
      const batch = preparedData.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('jobs')
        .insert(batch)
        .select();

      if (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error);
        if (error.code === 'PGRST204') {
          console.log('Jobs already exist, skipping...');
          break;
        }
      } else {
        inserted += data.length;
        console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${data.length} jobs)`);
      }
    }

    // Verify migration
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error verifying migration:', countError);
    } else {
      console.log(`\n✓ Migration complete! Total jobs in database: ${count}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
