#!/usr/bin/env python3
import json, os

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

articles = {
    "lea-plan-001-01-core-concept--d28bf43f-a588-4be3-8b79-8759d930aea4": "54dc99b80cb43e63c64192cf867862944c588c8c74a943cb490493220228fdf5",
    "lea-plan-001-03-core-concept--9c379f3b-c567-4615-957c-96e5bb791522": "2098ac444277444e2d590e784bad8950f39b532008cbab39aebd3d4a83634139",
    "lea-plan-002-01-core-concept--50d41d7e-57cd-4280-b850-e6d2f89414a6": "f9699bfd914806f830d32f12e1f2ee88d873d8504ac18b8efda93e4594d4513e",
    "lea-plan-003-01-what-you-need-to-know-for-the-lea--0d2e80df-4f76-484e-9b1f-5502da9e35be": "6612032c71f9d1c9c5b5f0f68140d9f3a77daacb97bef50d443ee0229cb49b5d",
    "lea-plan-004-01-what-you-need-to-know-for-the-lea--6a351c32-f48d-45fb-93f5-e60e6cd271c5": "64d36de59cabfa7a08e5740aa33a6cb438b580898341af6b1c23d6ac8c08f7c5",
    "lea-plan-005-03-what-you-need-to-know-for-the-lea--341161bb-c24a-4d65-8f8b-79a3e1b01076": "61e5a76d40c3c033b7f332647bf0ace4e6472c8de8dcf961196807a10cc59fcf",
    "lea-hist-004-01-core-concept--157a66ee-39c3-47ba-ba86-f32414fd2896": "6aeffc83938d1d2e8fb6cb20d9f41c4978a1f102575eed3e0802fd94efaf62d3",
    "lea-hist-007-01-core-concept--cde95089-b874-42c5-8250-abc58ad7fae0": "8c4a965b3760ecdc21df1145be41c44e013558e83f6282fd4115df4e53ad28cc",
    "lea-hist-008-01-core-concept--1f411bc4-4ca5-4bb2-ab46-e130e1b0a5e4": "d26b9f027be1574eef3622f4d15b3bc1a365991d8fc85e14c32d5fdadcd0e879",
    "lea-hist-001-02-core-concept--e72bf24e-a816-4c4f-ae4b-f8e97c5d5519": "4a1c33456736cf1d3776af71f6d05dfced569e956090adde4d4bf8226411a2d1",
}

for dirname, new_hash in articles.items():
    meta_path = os.path.join(BASE, dirname, "article-metadata.json")
    with open(meta_path) as f:
        meta = json.load(f)
    
    old_hash = meta.get("content_hash", "").replace("sha256:", "")
    if old_hash != new_hash:
        print(f"{dirname}:")
        print(f"  {old_hash} -> {new_hash}")
        meta["content_hash"] = f"sha256:{new_hash}"
        meta["original_content_hash"] = f"sha256:{new_hash}"
        with open(meta_path, 'w') as f:
            json.dump(meta, f, indent=2)
            f.write("\n")
    else:
        print(f"{dirname}: hash unchanged")
