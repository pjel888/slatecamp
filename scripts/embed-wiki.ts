
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { getAIProvider } from '../src/lib/ai/provider';

dotenv.config({ path: '.env.local' });

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supaUrl, supaKey);

async function embedWikiArticles() {
  console.log('Fetching wiki articles without embeddings...');
  
  // Fetch articles that don't have embeddings yet
  const { data: articles, error } = await supabase
    .from('wiki_articles')
    .select('article_id, title, content')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching articles:', error.message);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('No articles found needing embeddings.');
    return;
  }

  console.log(`Found ${articles.length} articles to embed.`);

  const ai = getAIProvider();

  for (const article of articles) {
    console.log(`Embedding article: ${article.title}...`);
    
    // Combine title and content for better context
    const textToEmbed = `${article.title}\n\n${article.content}`;
    
    try {
      const embedding = await ai.generateEmbedding(textToEmbed);
      
      const { error: updateError } = await supabase
        .from('wiki_articles')
        .update({ embedding })
        .eq('article_id', article.article_id);

      if (updateError) {
        console.error(`Error updating article ${article.article_id}:`, updateError.message);
      } else {
        console.log(`Successfully embedded: ${article.title}`);
      }
    } catch (err) {
      console.error(`Failed to embed ${article.title}:`, err);
    }
    
    // Tiny delay to avoid hitting rate limits too hard
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('Embedding process complete.');
}

embedWikiArticles();
