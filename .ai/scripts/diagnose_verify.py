#!/usr/bin/env python3
"""Read verify script and check the escaped-quotes detection string."""

with open('/Users/philiplewis/slatecamp/.ai/scripts/verify_articlemedia.py', 'rb') as f:
    lines = f.read().split(b'\n')
    line28 = lines[27]  # 0-indexed
    print(f"Line 28 raw: {line28}")
    # Find the string literal
    txt = line28.decode('utf-8')
    print(f"Line 28 text: {txt}")
    
# Test what the condition actually checks
test_tag = '<ArticleMedia id="test" layout="single" />'
search_str = '\\"'
print(f"\nSearch string repr: {repr(search_str)}")
print(f"Search string bytes: {search_str.encode()}")
print(f"Test tag has it? {search_str in test_tag}")
print(f"repr test tag has it? {search_str in repr(test_tag)}")

# What the script likely does wrong
print(f"\n--- Diagnosis ---")
print(f"The script checks: if 'backslash-quote' in tag")
print(f"But repr(tag) shows backslash-quote from repr() escaping")
print(f"The actual tag string has regular double-quotes, not backslash-quote")
print(f"So the check should FAIL (return False) — marking it as clean")
