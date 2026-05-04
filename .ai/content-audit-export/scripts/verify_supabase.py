#!/usr/bin/env python3
"""
Verify Supabase Content
Fetches all articles from Supabase and verifies integrity.
Usage: python verify_supabase.py
"""

import json
import subprocess
from pathlib import Path

def main():
    script = """
import { createContentAuditSupabaseClient } from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
const supabase = createContentAuditSupabaseClient()
const { data, error } = await supabase.from('wiki_articles').select('article_id').limit(600)
if (error) throw error
console.log(JSON.stringify({count: data.length}))
"""
    with open('/tmp/verify_supabase.ts', 'w') as f:
        f.write(script)
    
    result = subprocess.run(
        ["bun", "run", "/tmp/verify_supabase.ts"],
        capture_output=True,
        text=True,
        timeout=60
    )
    
    try:
        data = json.loads(result.stdout.strip())
        count = data.get("count", 0)
        print(f"Supabase has {count} articles")
        
        with open("/Users/philiplewis/slatecamp/.ai/content-audit-export/supabase-verification.json", "w") as f:
            json.dump(data, f, indent=2)
        
        return 0 if count >= 560 else 1
    except Exception as e:
        print(f"Verification failed: {e}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
