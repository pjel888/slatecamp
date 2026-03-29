
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supaUrl, supaKey);

async function run() {
  const { data: tax } = await supabase.from('wiki_article_taxonomy').select('*');
  console.log('wiki_article_taxonomy count:', tax?.length);

  const { data: unmapped } = await supabase.from('wiki_articles').select('*');
  console.log('wiki_articles total:', unmapped?.length);
  
  const { data: nodes } = await supabase.from('taxonomy_tree').select('level, name').eq('level', 3).limit(5);
  console.log('Sample level 3 nodes:', nodes);
}

run();

