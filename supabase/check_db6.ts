
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supaUrl, supaKey);

async function run() {
  const { data: tax } = await supabase.from('wiki_article_taxonomy').select('node_id').limit(20);
  const nodeIds = tax.map(t => t.node_id);
  const { data: nodes } = await supabase.from('taxonomy_tree').select('lea_id, level, name').in('node_id', nodeIds);
  console.log('Sample node lea_ids:', nodes.map(n => n.lea_id));
}

run();

