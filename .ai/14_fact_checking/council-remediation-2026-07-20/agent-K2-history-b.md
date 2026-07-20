# Agent K2 — History of Architecture (stream B) fact-check report

**Date:** 2026-07-20
**Scope:** 27 History of Architecture bundles (`/tmp/council-4-lists/hist-b.txt`)
**Branch:** `fact-check/article-question-remediation`
**Approach:** Bundle-internal consistency check first (does the marked-correct answer match the article body?), then targeted WebSearch verification of suspicious/verifiable claims (architect attribution, building dates, Pritzker laureate years, movement definitions).

## Totals

- Bundles audited: **27**
- Total linked questions checked: **294** (sum of `question_count` per bundle)
- Confirmed errors found: **0**
- Question-edit JSON files written: **0**
- Per-bundle remediation notes written: **0** (none needed — no confirmed errors)

No per-bundle `council-remediation-2026-07-20.md` files were created because the per-bundle instructions require them only for bundles with confirmed errors, and no errors were confirmed.

## Per-bundle verdict

| # | Bundle | Q-check | Verdict | Notes |
|---|---|---|---|---|
| 1 | lea-hist-008-03b-core-concept (Mies van der Rohe) | 11 | CLEAN | Mies/Barcelona Pavilion/Farnsworth/Seagram all consistent. Farnsworth "designed 1945, constructed 1950-1951" externally confirmed (Britannica, ArchDaily). |
| 2 | lea-hist-008-03c-core-concept (Walter Gropius) | 10 | CLEAN | Bauhaus founded 1919 Weimar, moved to Dessau 1925, Gropius directed 1919-1928 — all match article. |
| 3 | lea-hist-008-03d-core-concept (Alvar Aalto) | 11 | CLEAN | Paimio 1929-1933 externally confirmed (Alvar Aalto Foundation, CCA). Villa Mairea 1938-1939, Finlandia Hall 1971, bent plywood 1932 all match. |
| 4 | lea-hist-008-04a-core-concept (The Bauhaus) | 12 | CLEAN | Director sequence (Gropius/Meyer/Mies), closure 1933, Wassily Chair (Breuer) all match article. |
| 5 | lea-hist-008-04b-core-concept (International Style) | 12 | CLEAN | Hitchcock/Johnson MoMA 1932, Lever House (SOM), Tugendhat (Mies) attribution verified against UNESCO. |
| 6 | lea-hist-008-04c-core-concept (De Stijl/Constructivism/Expressionism) | 10 | CLEAN | Rietveld Schröder House 1924 (UNESCO), Tatlin Tower, Melnikov House 1927-1929, Einstein Tower Mendelsohn 1919-1924 (ArchDaily, Wikipedia) — all externally confirmed. |
| 7 | lea-hist-008-05-core-concept (Brutalism) | 11 | CLEAN | Barbican (Chamberlin/Powell/Bon, 1965+), Habitat 67 (Safdie, 158 residences — confirmed by Safdie Architects official page), Boston City Hall 1968 (Kallmann McKinnell Knowles), Kimbell (Kahn 1972) all consistent. |
| 8 | lea-hist-008-06-core-concept (Postmodern Architecture) | 10 | CLEAN | Portland Building (Graves 1982), Vanna Venturi (Venturi), AT&T/550 Madison (Johnson/Burgee), Piazza d'Italia (Moore), "Less is a bore" (Venturi) — all match article. |
| 9 | lea-hist-008-07a-core-concept (Deconstructivism) | 11 | CLEAN | MoMA 1988, Vitra Fire Station (Hadid 1993), House VI (Eisenman 1972-1975), Guggenheim Bilbao (Gehry 1997), Jewish Museum Berlin (Libeskind) — all match article. |
| 10 | lea-hist-008-07b-core-concept (Parametricism) | 10 | CLEAN | Schumacher theorist, Heydar Aliyev/Serpentine Sackler (ZHA) — consistent. |
| 11 | lea-hist-008-08-core-concept (Critical Regionalism) | 11 | CLEAN | Frampton 1983 essay, Murcutt/Magney, Ando/Church of the Light, Kéré/Gando — all match article. |
| 12 | lea-hist-008-09-core-concept (Pritzker Prize) | 12 | CLEAN | Johnson 1979, Niemeyer/Bunshaft 1988, Hadid 2004 (first woman), Frei Otto 2015 (posthumous), Aravena 2016, Kéré 2022 (first African), Wang Shu 2012 (first Chinese citizen), Liu Jiakun 2025, Smiljan Radić Clarke 2026 — all externally confirmed against Pritzker official + ArchDaily/NPR/CNN. |
| 13 | lea-hist-011-01-core-concept (Pre-Colonial African Architecture) | 10 | CLEAN | Great Zimbabwe dry-stone, Lalibela 12th-13th c. rock-hewn, Biete Giyorgis cruciform, Djenne toron maintenance — all match article. |
| 14 | lea-hist-011-02-core-concept (Colonial Architecture in Africa) | 11 | CLEAN | African Renaissance Monument Dakar 2010, Gando Primary School (Kéré), Makoko Floating School (Kunlé Adeyemi/NLE 2012), Asmara UNESCO — all match article. |
| 15 | lea-hist-012-01-core-concept (Maya and Aztec) | 12 | CLEAN | Maya corbelled vault, Templo Mayor (Tlaloc/Huitzilopochtli), Tikal Temple IV ~65m, Kukulkan/Chichen Itza ~30m, Classic Maya 250-900 CE vs Aztec 1345-1521 CE — all match article. |
| 16 | lea-hist-012-02-core-concept (Inca) | 12 | CLEAN | Machu Picchu 2,430 m, Qhapaq Ñan ~30,000 km, polygonal ashlar, Ollantaytambo — all match article (article explicitly warns against the wrong 40,000 km figure). |
| 17 | lea-hist-012-03-core-concept (North American Indigenous) | 12 | CLEAN | Pueblo Bonito 650-800 rooms D-shaped, Chaco ~850-1150 CE, Taos Pueblo, Monks Mound ~30 m — all match article. |
| 18 | lea-hist-013-01-core-concept (Spanish Colonial Latin America) | 10 | CLEAN | Laws of the Indies 1573, plaza mayor, portales, mestizo Baroque — all match article. |
| 19 | lea-hist-013-02-core-concept (Latin American Modernism) | 11 | CLEAN | Costa (Pilot Plan), Niemeyer (sculptural concrete), Barragán (color/light/water), Brasília 1960/Kubitschek, Barragán Pritzker 1980 — all match article. |
| 20 | lea-hist-014-01-core-concept (American Colonial) | 10 | CLEAN | New England timber/central chimney, Chesapeake brick plantation w/ dependencies, coquina/Castillo de San Marcos, Federal 1780-1820 — all match article. |
| 21 | lea-hist-014-02-core-concept (Modern Skyscraper / Chicago School) | 11 | CLEAN | Home Insurance (Jenney 1885), Sullivan "form follows function," Wainwright, Masonic Temple ~22 stories (sources give 21-22, article says "approximately 22" — within source range per Preservation Chicago/Skyscraper Museum). |
| 22 | lea-hist-014-03-core-concept (École des Beaux-Arts) | 11 | CLEAN | BPL McKim Building (McKim Mead & White 1895), Penn Station (McKim Mead & White 1910, Roman Baths of Caracalla precedent — externally confirmed by Wikipedia/ArchDaily/NY Historical). |
| 23 | lea-hist-014-04-core-concept (Frank Lloyd Wright) | 12 | CLEAN | Fallingwater (reinforced-concrete cantilevers, 1939), Prairie/Robie, Usonian, Guggenheim spiral ramp — all match article. |
| 24 | lea-hist-014-05-core-concept (International Style Modernism in America) | 12 | CLEAN | Mies "less is more," Saarinen TWA 1962/Gateway Arch 1965, Kahn mass+light, Pei East Building NGA 1978 — all match article. |
| 25 | lea-hist-015-01-core-concept (Indigenous Australian Architecture) | 10 | CLEAN | Gunyah/wurley/goondie, Budj Bim aquaculture, Hyde Park Barracks (Greenway 1817-1819), colonization 1788 — all match article. |
| 26 | lea-hist-015-02-core-concept (Sydney Opera House) | 11 | CLEAN | Utzon (Danish) 1957 competition, Bennelong Point/Tubowgule, Utzon resignation 1966, opened 1973, spherical shell solution, Arup — all match article. |
| 27 | lea-hist-015-03-core-concept (Māori Architecture) | 12 | CLEAN | Whare/wharenui/marae/pā/tukutuku/whakapapa terminology, Treaty of Waitangi 1840, kauri/rimu/totara timber — all match article. |

## Methodology

1. Dumped every bundle's `normalized.md` + `linked-questions.json` into a single review file (`/tmp/k2-audit/all-bundles.txt`, 3,702 lines, 27 bundles, 294 questions).
2. Read the full dump end-to-end checking that the marked-correct option (a) is the one whose rationale the article supports and (b) does not contradict the article's stated dates, attributions, or definitions.
3. For externally verifiable claims (architects, dates, building heights, Pritzker years, UNESCO attributions), ran targeted WebSearches against authoritative sources (Pritzker official, Britannica, Wikipedia, ArchDaily, UNESCO, Alvar Aalto Foundation, Safdie Architects, NPS, NY Historical, Skyscraper Museum).

## External facts verified (no discrepancy found)

- Pritzker 2025 = Liu Jiakun (Pritzkerprize.com, NPR, CNN)
- Pritzker 2026 = Smiljan Radić Clarke, 2nd Chilean after Aravena (CNN, ArchDaily, Dezeen)
- Wang Shu = first Chinese citizen Pritzker laureate, 2012 (Wikipedia, Guardian, ArchDaily)
- Habitat 67 = 158 residences, Moshe Safdie, Montreal (Safdie Architects, ArchDaily)
- Farnsworth House = designed 1945, completed 1951 (Britannica, ArchDaily)
- Paimio Sanatorium = 1929-1933, Aalto (Alvar Aalto Foundation, CCA)
- Masonic Temple Chicago = 21-22 stories, Burnham & Root, 1892 (Wikipedia, Preservation Chicago, Skyscraper Museum)
- Pennsylvania Station = 1910, McKim Mead & White, Baths of Caracalla precedent (Wikipedia, NY Historical, ArchDaily)
- Einstein Tower = Mendelsohn, Potsdam, 1919-1924 (ArchDaily, Wikipedia)
- Schröder House = Rietveld, Utrecht, 1924, De Stijl (UNESCO, Wikipedia)
- Tugendhat House = Mies van der Rohe, Brno, 1930, International Style (UNESCO, ArchDaily)
- Ministry of Education & Health, Rio = Niemeyer credited alongside Costa and Le Corbusier (Arquitectura Viva, MoMA, Wikipedia) — article's "Niemeyer's … Ministry of Education building in Rio" framing is defensible at exam-recognition level.

## Conclusion

The History of Architecture stream (27 bundles, 294 linked questions) is internally consistent and externally accurate across the verified sample. **Zero confirmed errors. Zero question-edit files written.** No further remediation recommended for this stream.

## Sources

- https://www.pritzkerprize.com/laureates/liu-jiakun
- https://www.pritzkerprize.com/
- https://edition.cnn.com/2026/03/12/style/pritzker-prize-winner-smiljan-radic
- https://www.archdaily.com/1039553/smiljan-radic-clarke-receives-the-2026-pritzker-prize-the-artist-of-unspoken-architecture
- https://www.theguardian.com/artanddesign/2012/feb/28/wang-shu-wins-pritzker-prize
- https://en.wikipedia.org/wiki/Wang_Shu
- https://www.safdiearchitects.com/projects/habitat-67
- https://www.archdaily.com/404803/ad-classics-habitat-67-moshe-safdie
- https://www.britannica.com/topic/Farnsworth-House
- https://www.archdaily.com/59719/ad-classics-the-farnsworth-house-mies-van-der-rohe
- https://www.alvaraalto.fi/en/architecture/paimio-sanatorium/
- https://www.cca.qc.ca/en/articles/issues/23/take-care/816/the-tuberculosis-sanatorium-of-paimio
- https://en.wikipedia.org/wiki/Masonic_Temple_(Chicago)
- https://www.preservationchicago.org/masonic-temple-by-burnham-root-built-1892-demolished-1939/
- https://skyscraper.org/tallest-towers/masonic-temple/
- https://en.wikipedia.org/wiki/Pennsylvania_Station_(1910%E2%80%931963)
- https://www.archdaily.com/475072/ad-classics-pennsylvania-station-mckim-mead-and-white
- https://www.nyhistory.org/blogs/mckim-mead-whites-glorious-old-penn-station-turns-103
- https://www.archdaily.com/402033/ad-classics-the-einstein-tower-erich-mendelsohn
- https://en.wikipedia.org/wiki/Einstein_Tower
- https://whc.unesco.org/en/list/965/ (Rietveld Schröder House)
- https://en.wikipedia.org/wiki/Rietveld_Schr%C3%B6der_House
- https://whc.unesco.org/en/list/1052/ (Tugendhat Villa)
- https://www.archdaily.com/157555/ad-classics-villa-tugendhat-mies-van-der-rohe
- https://arquitecturaviva.com/works/ministerio-de-educacion-y-salud-rio-de-janeiro-
- https://www.moma.org/collection/works/82483
- https://en.wikipedia.org/wiki/Gustavo_Capanema_Palace
