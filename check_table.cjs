const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://fitbuvxhovynlecwmdrc.supabase.co', 'sb_publishable_WHb4iFRSMIrDHW1eQOc9ag_tQ8JbbPn');

async function test() {
  const { data: m, error: me } = await s.from('members').select('*');
  console.log('MEMBERS_TABLE:', { m, me });
  const { data: q, error: qe } = await s.from('specialist_questions').select('*');
  console.log('SPECIALIST_QUESTIONS_TABLE:', { q, qe });
}
test();

