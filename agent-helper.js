/**
 * Job Board Agent Helper
 * Dubblett-kontroll och job-addition logik
 */

const API_URL = 'http://localhost:3000/api/jobs';

/**
 * Kontrollera om ett jobb redan finns i databasen
 * @param {Object} newJob - Nytt jobb att kontrollera
 * @param {Array} existingJobs - Lista med befintliga jobb
 * @returns {Object|null} - Befintligt jobb om dubblett hittas, null om nytt
 */
function findDuplicate(newJob, existingJobs) {
  return existingJobs.find(existing =>
    existing.title.toLowerCase().trim() === newJob.title.toLowerCase().trim() &&
    existing.company.toLowerCase().trim() === newJob.company.toLowerCase().trim() &&
    existing.location.toLowerCase().trim() === newJob.location.toLowerCase().trim()
  );
}

/**
 * Hämta alla befintliga jobb från databasen
 * @returns {Promise<Array>} - Array av alla jobb
 */
async function getExistingJobs() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ Kunde inte hämta befintliga jobb:', error.message);
    return [];
  }
}

/**
 * Lägg till nytt jobb om det inte är en dubblett
 * @param {Object} jobData - Jobbdata att lägga till
 * @param {Array} existingJobs - Lista med befintliga jobb
 * @returns {Promise<Object|null>} - Tillagd jobb eller null om dubblett
 */
async function addJobIfNotDuplicate(jobData, existingJobs) {
  // Kontrollera dubblett
  const duplicate = findDuplicate(jobData, existingJobs);

  if (duplicate) {
    console.log(
      `❌ DUBLETTER: "${jobData.title}" @ ${jobData.company} finns redan (ID: ${duplicate.id})`
    );
    return null;
  }

  // Lägg till nytt jobb
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const addedJob = await response.json();
    console.log(
      `✅ NYTT JOBB TILLAGD: "${addedJob.title}" @ ${addedJob.company} (ID: ${addedJob.id})`
    );
    return addedJob;
  } catch (error) {
    console.error(
      `❌ FEL vid tillägg av "${jobData.title}":`,
      error.message
    );
    return null;
  }
}

/**
 * Huvudfunktion för att lägga till flera jobb med dubblett-kontroll
 * @param {Array} jobsToAdd - Array av jobb att försöka lägga till
 * @returns {Promise<Object>} - Statistik över operation
 */
async function addJobsWithDuplicateCheck(jobsToAdd) {
  console.log('\n🤖 Job Board Agent startar...\n');

  // Hämta alla befintliga jobb en gång
  console.log('📊 Hämtar befintliga jobb från databasen...');
  const existingJobs = await getExistingJobs();
  console.log(`   Totalt befintliga jobb: ${existingJobs.length}\n`);

  // Håll statistik
  const stats = {
    attempted: jobsToAdd.length,
    added: 0,
    duplicates: 0,
    errors: 0,
    addedIds: [],
    duplicateIds: []
  };

  // Lägg till jobb en efter en
  for (const jobData of jobsToAdd) {
    const result = await addJobIfNotDuplicate(jobData, existingJobs);

    if (result) {
      stats.added++;
      stats.addedIds.push(result.id);
      // Lägg till i befintliga för nästa iteration
      existingJobs.push(result);
    } else if (findDuplicate(jobData, existingJobs)) {
      stats.duplicates++;
      stats.duplicateIds.push({
        title: jobData.title,
        company: jobData.company
      });
    } else {
      stats.errors++;
    }
  }

  // Skriv ut sammanfattning
  console.log('\n' + '='.repeat(50));
  console.log('📈 RESULTAT');
  console.log('='.repeat(50));
  console.log(`✅ Nya jobb tillagda: ${stats.added}`);
  console.log(`⚠️  Dubletter ignorerade: ${stats.duplicates}`);
  console.log(`❌ Fel: ${stats.errors}`);
  console.log('='.repeat(50) + '\n');

  if (stats.addedIds.length > 0) {
    console.log(`🆔 Nya jobb-ID: ${stats.addedIds.join(', ')}\n`);
  }

  return stats;
}

/**
 * Exempel på användning
 */
async function exampleUsage() {
  const jobsToAdd = [
    {
      title: 'Junior Frontend Developer',
      company: 'TechCorp AB',
      location: 'Stockholm',
      salary: '35 000 SEK/månad',
      url: 'https://example.com/job1',
      score: 75,
      stage: 'new',
      source: 'Indeed.se',
      description: 'Vi söker en junior frontend-utvecklare med JavaScript-kunskap.'
    },
    {
      title: 'Junior Säljare',
      company: 'SalesInc AB',
      location: 'Göteborg',
      salary: 'Enligt överenskommelse',
      url: 'https://example.com/job2',
      score: 65,
      stage: 'new',
      source: 'LinkedIn',
      description: 'Sälj våra produkter och tjänster till nya kunder.'
    }
  ];

  const stats = await addJobsWithDuplicateCheck(jobsToAdd);
  return stats;
}

// Exportera funktioner för andra moduler
module.exports = {
  findDuplicate,
  getExistingJobs,
  addJobIfNotDuplicate,
  addJobsWithDuplicateCheck,
  exampleUsage
};

// Om scriptade direkt, kör exempel
if (require.main === module) {
  exampleUsage().catch(console.error);
}
