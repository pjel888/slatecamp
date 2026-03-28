
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supaUrl, supaKey);

async function run() {
  const { data: articles } = await supabase.from('wiki_articles').select('article_id').limit(5);
  console.log('Sample wiki_articles article_id:', articles?.map(a => a.article_id));
  
  const articleIds = articles?.map(a => a.article_id) || [];
  
  const { data: mappingRows } = await supabase.from('wiki_article_taxonomy').select('*').in('article_id', articleIds);
  console.log('Sample wiki_article_taxonomy for those articles:', mappingRows);
}

run();

