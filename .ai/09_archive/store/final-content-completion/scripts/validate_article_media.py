#!/usr/bin/env python3
"""
Validate ArticleMedia placeholders in normalized.md articles.
Checks for correct syntax, required fields, and potential issues.
"""
import re, json, os, sys
from pathlib import Path

BASE = "/Users/philiplewis/slatecamp"
ARTICLES_DIR = f"{BASE}/.ai/content-audit-export/articles"

def find_article_media_tags(content):
    """Find all <ArticleMedia ... /> tags in content."""
    # Match self-closing ArticleMedia tags
    pattern = re.compile(r'<ArticleMedia\s+([^/>]*?)\s*/>', re.DOTALL)
    return pattern.findall(content)

def parse_props(props_str):
    """Parse MDX-style props string into dict."""
    props = {}
    # Match prop="value" and prop='value'
    pattern = re.compile(r'(\w+)\s*=\s*"([^"]*?)"')
    for match in pattern.finditer(props_str):
        props[match.group(1)] = match.group(2)
    pattern2 = re.compile(r"(\w+)\s*=\s*'([^']*?)'")
    for match in pattern2.finditer(props_str):
        props[match.group(1)] = match.group(2)
    return props

def validate_single_media(id_field, props, file_path):
    """Validate a single ArticleMedia usage."""
    errors = []
    warnings = []
    
    # Required: id
    if not id_field:
        errors.append("Missing required prop: id")
    
    # Check layout
    layout = props.get("layout", "single")
    valid_layouts = {"single", "carousel", "gallery", "embed"}
    if layout not in valid_layouts:
        errors.append(f"Invalid layout: {layout}")
    
    # Check type
    media_type = props.get("type", "image")
    valid_types = {"image", "youtube", "video", "embed"}
    if media_type not in valid_types:
        errors.append(f"Invalid type: {media_type}")
    
    # Check status
    status = props.get("status", "placeholder")
    if status not in ("placeholder", "ready"):
        errors.append(f"Invalid status: {status}")
    
    # Check variant
    variant = props.get("variant", "default")
    valid_variants = {"default", "wide", "contained", "inline", "hero"}
    if variant not in valid_variants:
        errors.append(f"Invalid variant: {variant}")
    
    # Check aspect ratio
    ar = props.get("aspectRatio", "16:9")
    valid_ars = {"16:9", "4:3", "3:2", "1:1", "auto"}
    if ar not in valid_ars:
        warnings.append(f"Unusual aspect ratio: {ar}")
    
    # Check carousel has carouselCount
    if layout in ("carousel", "gallery"):
        carousel_count = props.get("carouselCount", "")
        if not carousel_count:
            warnings.append("Carousel without carouselCount — defaulting to 1 item")
        elif carousel_count.isdigit() and int(carousel_count) < 2:
            errors.append(f"Carousel with carouselCount={carousel_count} — need at least 2")
    
    # Check ready status has required source
    if status == "ready":
        if media_type == "image" and not props.get("src"):
            errors.append("Image marked ready but missing src")
        if media_type == "youtube" and not props.get("youtubeId"):
            errors.append("YouTube marked ready but missing youtubeId")
        if media_type == "embed" and not props.get("embedUrl"):
            errors.append("Embed marked ready but missing embedUrl")
    
    # Check placeholder has alt or caption
    if status == "placeholder":
        if not props.get("alt") and not props.get("caption"):
            warnings.append("Placeholder without alt or caption — editor won't know what to add")
        if not props.get("suggestedAsset"):
            warnings.append(f"Placeholder '{id_field}' without suggestedAsset — harder for future editor")
    
    return errors, warnings

def main():
    print("=" * 70)
    print("ArticleMedia Validation")
    print("=" * 70)
    
    if not os.path.isdir(ARTICLES_DIR):
        print(f"Articles directory not found: {ARTICLES_DIR}")
        return
    
    articles = sorted([d for d in os.listdir(ARTICLES_DIR) if os.path.isdir(os.path.join(ARTICLES_DIR, d))])
    
    total_media_blocks = 0
    articles_with_media = 0
    all_errors = []
    all_warnings = []
    
    for folder in articles:
        nm_path = os.path.join(ARTICLES_DIR, folder, "normalized.md")
        if not os.path.exists(nm_path):
            continue
        
        with open(nm_path, encoding="utf-8") as f:
            content = f.read()
        
        tags = find_article_media_tags(content)
        if not tags:
            continue
        
        articles_with_media += 1
        for tag_str in tags:
            total_media_blocks += 1
            props = parse_props(tag_str)
            id_field = props.get("id", "unknown")
            
            errors, warnings = validate_single_media(id_field, props, nm_path)
            for e in errors:
                all_errors.append(f"{folder[:50]}: {id_field}: {e}")
            for w in warnings:
                all_warnings.append(f"{folder[:50]}: {id_field}: {w}")
    
    print(f"\nArticles scanned: {len(articles)}")
    print(f"Articles with ArticleMedia: {articles_with_media}")
    print(f"Total ArticleMedia blocks: {total_media_blocks}")
    print(f"Errors: {len(all_errors)}")
    print(f"Warnings: {len(all_warnings)}")
    
    if all_errors:
        print("\nErrors:")
        for e in all_errors[:20]:
            print(f"  ❌ {e}")
        if len(all_errors) > 20:
            print(f"  ... and {len(all_errors) - 20} more")
    
    if all_warnings:
        print("\nWarnings:")
        for w in all_warnings[:20]:
            print(f"  ⚠️  {w}")
        if len(all_warnings) > 20:
            print(f"  ... and {len(all_warnings) - 20} more")
    
    result = {
        "articles_scanned": len(articles),
        "articles_with_media": articles_with_media,
        "total_media_blocks": total_media_blocks,
        "errors": len(all_errors),
        "warnings": len(all_warnings),
        "error_list": all_errors[:50],
        "warning_list": all_warnings[:50],
        "pass": len(all_errors) == 0
    }
    
    with open(f"{BASE}/.ai/final-content-completion/media-validation-report.json", "w") as f:
        json.dump(result, f, indent=2)
    
    print(f"\n{'PASS' if result['pass'] else 'HAS ERRORS'}")

if __name__ == "__main__":
    main()
