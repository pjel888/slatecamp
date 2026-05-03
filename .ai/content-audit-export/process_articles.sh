#!/bin/bash
# Batch process articles: fix typos, add Learning Goals, add components
set -e

BASE="/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

echo "=== Processing Article 1: lea-plan-001-01-core-concept (Urban Planning) ==="
DIR="$BASE/lea-plan-001-01-core-concept--d28bf43f-a588-4be3-8b79-8759d930aea4"
cd "$DIR"
# Fix typos - already fixed Planning Sclea
# Fix any remaining typos
echo "Article 1 done"

echo "=== Processing Article 2: lea-plan-001-03-core-concept (Planning in the Philippines) ==="
DIR="$BASE/lea-plan-001-03-core-concept--9c379f3b-c567-4615-957c-96e5bb791522"
cd "$DIR"
# Add Learning Goal after intro paragraph
python3 -c "
content = open('original.md').read()
# Insert Learning Goal after the first paragraph (after What You Need to Know)
old = '## What You Need to Know for the LEA\n\n'
old += 'Philippine urban planning history is shaped by three distinct eras: Spanish colonial grid-plaza planning, American City Beautiful intervention, and postwar devolution to local authority. This article tests your knowledge of the _historical narrative_, especially the Burnham Plan of Manila (1905) and the Laws of the Indies (1573), which you must know in detail. Contemporary planners and agencies are tested elsewhere.'
new = old + '\n\n## Learning Goal\n\nIdentify the three eras of Philippine planning history—Spanish colonial (Laws of the Indies, 1573), American colonial (Burnham Plan of Manila, 1905), and post-devolution (RA 7160, 1991)—and describe the key features and legacy of each period.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Added Learning Goal')
"

echo "=== Processing Article 3: lea-plan-002-01-core-concept (Urban Structure Models) ==="
DIR="$BASE/lea-plan-002-01-core-concept--50d41d7e-57cd-4280-b850-e6d2f89414a6"
cd "$DIR"
python3 -c "
content = open('original.md').read()
old = '## What You Need to Know for the LEA\n\n'
old += 'The three classical urban models — Concentric Zone, Sector, and Multiple Nuclei — explain how cities grow and organize spatially. Each model identifies the theorist, the year, and the underlying mechanism. These are the most-tested models in the LEA and the most commonly swapped by mistake.'
new = old + '\n\n## Learning Goal\n\nDistinguish the three classical urban structure models (Concentric Zone, Sector, Multiple Nuclei) by theorist, year, mechanism, and spatial pattern, and identify supporting concepts including Central Place Theory, Von Thünen Rings, Rank-Size Rule, and Primate City.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Added Learning Goal')
"

echo "=== Processing Article 4: lea-plan-003-01-what-you-need-to-know-for-the-lea (Housing Law) ==="
DIR="$BASE/lea-plan-003-01-what-you-need-to-know-for-the-lea--0d2e80df-4f76-484e-9b1f-5502da9e35be"
cd "$DIR"
python3 -c "
content = open('original.md').read()

# Fix typos: equivleant -> equivalent
content = content.replace('equivleant', 'equivalent')
# Fix 5050% -> 50% (broken markdown)
content = content.replace('5050%', '50%')
# Fix efund. -> refund.
content = content.replace('efund.', 'refund.')

# Add Learning Goal
old = '## What You Need to Know for the LEA\n\n'
old += 'Philippine housing law operates through a layered system of buyer protection, developer regulation, and socialized housing standards. Five core laws establish the framework: PD 957 controls market-rate subdivisions and condominiums; BP 220 sets minimum area standards for economic and socialized housing; RA 7279 (UDHA) mandates eviction protections and balanced housing; RA 6552 (Maceda Law) provides installment buyer safeguards; and RA 10884 quantifies the balanced housing percentage. Understanding which law governs which housing type and which provision belongs to which law is the foundation of housing law competency.'
new = old + '\n\n## Learning Goal\n\nIdentify the five core Philippine housing laws (PD 957, BP 220, RA 7279/UDHA, RA 6552/Maceda Law, RA 10884) and describe their key provisions: developer registration, open space requirements, minimum lot and floor areas, eviction protections, balanced housing percentages, and installment buyer safeguards.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Fixed housing law article')
"

echo "=== Processing Article 5: lea-plan-004-01 (Physical & Aesthetic) ==="
DIR="$BASE/lea-plan-004-01-what-you-need-to-know-for-the-lea--6a351c32-f48d-45fb-93f5-e60e6cd271c5"
cd "$DIR"
sed -i '' 's/human-sclead/human-scale/g' original.md
python3 -c "
content = open('original.md').read()
old = '## What You Need to Know for the LEA\n\n'
old += 'Physical and aesthetic considerations are the starting point for site planning. Before you design, manage, or maintain a site, you must understand the terrain, its visual qualities, and how sun, wind, and existing views shape what is possible. This article focuses on reading the land itself—not on design choices, which belong to other articles.'
new = old + '\n\n## Learning Goal\n\nAnalyze physical site conditions—topography, sun orientation, wind patterns, views, height-to-width ratios, soils, utilities, and legal constraints—to determine what is possible on a site before design begins.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Fixed physical article')
"

echo "=== Processing Article 6: lea-plan-005-03 (Environmental Planning) ==="
DIR="$BASE/lea-plan-005-03-what-you-need-to-know-for-the-lea--341161bb-c24a-4d65-8f8b-79a3e1b01076"
cd "$DIR"
sed -i '' 's/Large-sclea/Large-scale/g' original.md
sed -i '' 's/large-sclea/large-scale/g' original.md
python3 -c "
content = open('original.md').read()

# Fix the broken WikiExamTable on line 11
old_table = '<WikiExamTable headers={\"Water Body Type\", \"Easement Distance from Edge\", \"Legal Basirows={[ [\"All water bodies (urban areas)\", \"3 meters\", \"PD 1067 Art 51\"], [\"All water bodies (agricultural areas)\", \"20 meters\", \"PD 1067 Art 51\"], [\"All water bodies (forest areas)\", \"40 meters\", \"PD 1067 Art 51\"], [\"Sea and foreshore\", \"40 meters from maximum high tide line (forest zone)\", \"PD 1067 Art 51\"] ]} \"PD 1067\"]]} />'
new_table = '<WikiExamTable headers={[\"Water Body Type\", \"Easement Distance from Edge\", \"Legal Basis\"]} rows={[[\"All water bodies (urban areas)\", \"3 meters\", \"PD 1067 Art 51\"], [\"All water bodies (agricultural areas)\", \"20 meters\", \"PD 1067 Art 51\"], [\"All water bodies (forest areas)\", \"40 meters\", \"PD 1067 Art 51\"], [\"Sea and foreshore\", \"40 meters from maximum high tide line (forest zone)\", \"PD 1067 Art 51\"]]} />'
content = content.replace(old_table, new_table)

# Add Learning Goal
old = '## What You Need to Know for the LEA\n\n'
old += 'Environmental and land-use planning in the Philippines is governed by a framework of Presidential Decrees and Republic Acts that establish easements, require environmental impact assessment, protect natural areas, manage water quality, and regulate solid waste. Landscape architects, planners, and developers must understand these laws to design compliant projects and avoid legal liability. This article covers the core provisions of five essential Philippine environmental and planning laws: **PD 1067 (Water Code)**, **PD 1586 (EIS System)**, **RA 7586 (NIPAS)**, **RA 9275 (Clean Water Act)**, and **RA 9003 (Solid Waste Act)**.'
new = old + '\n\n## Learning Goal\n\nIdentify the five key Philippine environmental and land-use laws (PD 1067, PD 1586, RA 7586, RA 9275, RA 9003) and describe their core provisions: water body easement distances, EIS/ECC requirements, NIPAS protected areas, wastewater treatment obligations, and solid waste management standards.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Fixed environmental article')
"

echo "=== Processing Article 7: lea-hist-004-01-core-concept (Islamic) ==="
DIR="$BASE/lea-hist-004-01-core-concept--157a66ee-39c3-47ba-ba86-f32414fd2896"
cd "$DIR"
python3 -c "
content = open('original.md').read()
old = '## What You Need to Know for the LEA\n\n<Callout>The LEA tests your ability to identify and explain the foundational architectural vocabulary of Islamic design. You must recognize the defining structural and decorative elements that appear across regional variations.</Callout>'
new = old + '\n\n## Learning Goal\n\nIdentify and describe the five pillars of Islamic architectural vocabulary—Mosque, Minaret, Mihrab, Muqarnas, Arabesques/Calligraphy—and explain their structural function, religious purpose, and regional variation across Islamic architecture.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Fixed Islamic article')
"

echo "=== Processing Article 8: lea-hist-007-01-core-concept (Indian) ==="
DIR="$BASE/lea-hist-007-01-core-concept--cde95089-b874-42c5-8250-abc58ad7fae0"
cd "$DIR"
# Fix typos
sed -i '' 's/equivleant/equivalent/g' original.md
python3 -c "
content = open('original.md').read()
old = '## What You Need to Know for the LEA\n\n<Callout>\nThe LEA tests your knowledge of Hindu temple structure (shikhara towers), Buddhist monuments (stupas), and Mughal architecture (tombs and gardens). Recognize key buildings, understand their spatial organization, and distinguish temple typologies and periods.\n</Callout>'
new = old + '\n\n## Learning Goal\n\nDistinguish the three major Indian architectural traditions—Hindu (shikhara, gopura, garbhagriha), Buddhist (stupa, pradakshina), and Mughal (chahar bagh, pietra dura, domed chambers)—by their key structures, spatial organization, materials, and chronological development.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Fixed Indian article')
"

echo "=== Processing Article 9: lea-hist-008-01-core-concept (19th Century) ==="
DIR="$BASE/lea-hist-008-01-core-concept--1f411bc4-4ca5-4bb2-ab46-e130e1b0a5e4"
cd "$DIR"
# Fix typo
sed -i '' 's/unprecedented sclea/unprecedented scale/g' original.md
python3 -c "
content = open('original.md').read()
old = '## What You Need to Know for the LEA\n\n<Callout>The 19th century marks the transition from historical revivals to modern architecture through industrial innovation and design reform movements. The board exam tests your knowledge of key buildings, the shift from ornamental excess to functional design, and the architects who bridged tradition and modernity.</Callout>'
new = old + '\n\n## Learning Goal\n\nIdentify the key 19th-century buildings, movements, and architects—Crystal Palace (Paxton), Arts and Crafts (Morris, Voysey), Chicago School (Sullivan, Jenney)—and explain how industrial materials, design reform, and the principle of form follows function transformed architecture from ornament-driven revivalism toward modernism.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Fixed 19th Century article')
"

echo "=== Processing Article 10: lea-hist-001-02-core-concept (Mesopotamian) ==="
DIR="$BASE/lea-hist-001-02-core-concept--e72bf24e-a816-4c4f-ae4b-f8e97c5d5519"
cd "$DIR"
python3 -c "
content = open('original.md').read()
old = '## What You Need to Know for the LEA\n\n<Callout>\nMesopotamian architecture tests your ability to identify structural innovations, building types, and the relationship between religion and urban planning in civilization\\'s earliest complex society. The LEA expects knowledge of ziggurats, palaces, city walls, and the architectural responses to a floodplain environment.\n</Callout>'
new = old + '\n\n## Learning Goal\n\nIdentify key Mesopotamian building types (ziggurat, palace, city wall), their construction materials and methods (mud brick, bitumen), and explain how religious cosmology, floodplain constraints, and available resources shaped the architecture of civilization\\'s earliest complex urban societies.\n'
content = content.replace(old, new)
open('original.md','w').write(content)
print('Fixed Mesopotamian article')
"

echo "=== All articles processed ==="
