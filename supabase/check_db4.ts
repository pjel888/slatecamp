
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supaUrl, supaKey);

async function run() {
  const { data: articles, error: err1 } = await supabase
    .from('wiki_articles')
    .select('article_id')
    .limit(500);
    
  if (err1) throw err1;
  const articleIds = articles.map(a => a.article_id);
  
  console.log('Got', articleIds.length, 'article IDs');
  
  const { data: mappings, error: err2 } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id, node_id')
    .in('article_id', articleIds);
    
  console.log('Error:', err2);
  console.log('Mappings:', mappings?.length);
}

run();

