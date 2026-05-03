#!/usr/bin/env python3
"""
Polish 116 History & Theory core-concept articles for learning effectiveness.
Process 15-20 at a time in batches using Python.
For each article:
  1. Replace generic boilerplate Learning Goals with specific objectives tied to ALE topics
  2. Remove AI meta-commentary ("After reading this article, you should be able to:")
  3. Add cross-references to related articles
  4. Add missing ExamTip where appropriate
  5. Update normalized_content_hash in ui-blocks.json after changes
  6. Do NOT change factual content
"""

import hashlib
import json
import os
import re
import sys

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# ── Specific learning goals for each History article ─────────────────────

HIST_GOALS = {
    # 001 - Ancient
    "lea-hist-001-01": "Identify megalithic architectural forms (dolmens, menhirs, stone circles, passage graves) by structure and site, explain the post-and-lintel system, and recognize key sites (Stonehenge, Newgrange, Carnac) by location, date, and feature.",
    "lea-hist-001-02": "Explain how Mesopotamian architects used mud brick to create monumental structures (ziggurats, palaces, city walls) in a floodplain environment, and identify key examples (Ziggurat of Ur, Palace of Sennacherib) by builder, date, and structural innovation.",
    "lea-hist-001-03": "Identify Persian architectural innovations — apadana halls, columned audience chambers, glazed brick decoration — and recognize key sites (Persepolis, Pasargadae, Susa) by their spatial organization, ornamental vocabulary, and cultural synthesis across conquered regions.",
    "lea-hist-001-04": "Trace the evolution of Egyptian monumental architecture from mastaba to stepped pyramid to true pyramid, explain the structural and symbolic significance of each form, and identify key pyramids (Giza, Saqqara, Dahshur) by builder, date, and innovation.",
    "lea-hist-001-05": "Distinguish the three Greek orders (Doric, Ionic, Corinthian) by proportion, capital form, and entablature design; identify the Parthenon's optical refinements; and explain the post-and-lintel system as the structural basis of Greek temple architecture.",
    "lea-hist-001-06": "Identify Roman architectural innovations — concrete construction, the arch, the vault, the dome — and their application in key building types (Pantheon, Colosseum, aqueducts, basilicas) and explain how Roman engineering enabled unprecedented interior space and urban infrastructure.",
    "lea-hist-001-08": "Identify the key characteristics of Indus Valley civilization architecture — grid-plan cities, standardized brick sizes, advanced drainage systems, the Great Bath of Mohenjo-Daro — and explain how urban planning and water management reveal sophisticated civic organization.",
    
    # 002 - Medieval to Baroque
    "lea-hist-002-01": "Distinguish Early Christian basilica plans from Byzantine centralized domed churches and explain the pendentive dome innovation as exemplified by Hagia Sophia.",
    "lea-hist-002-02": "Identify Romanesque architectural characteristics — barrel vaults, groin vaults, thick walls, small windows, cruciform plans — and recognize key examples (Pisa Cathedral, Durham Cathedral, Speyer Cathedral) by their structural and regional distinctions.",
    "lea-hist-002-03": "Identify Gothic architectural innovations — pointed arch, ribbed vault, flying buttress — and explain how the structural system enabled verticality, natural light, and the skeletal stone framework exemplified at Chartres, Notre Dame, and Amiens.",
    "lea-hist-002-04": "Identify the key Renaissance architects (Brunelleschi, Alberti, Bramante, Michelangelo, Palladio) and their major works, and explain how classical orders, linear perspective, humanist proportion, and centralized plans defined Renaissance architectural theory.",
    "lea-hist-002-05": "Identify the five testable markers of Baroque architecture — curved walls, hidden light sources, ornamented plans, trompe-l'oeil painting, sculptural facades — and recognize key works (St. Peter's, San Carlo alle Quattro Fontane, Versailles) by their dynamic spatial and visual effects.",
    "lea-hist-002-06": "Identify the three catalysts of Neoclassicism — archaeological discoveries (Pompeii, Herculaneum), Grand Tour travel, and Enlightenment rationalism — and recognize key buildings (La Madeleine, Brandenburg Gate, US Capitol) by their revival of Greek and Roman forms.",
    
    # 004 - Islamic
    "lea-hist-004-01": "Identify the five pillars of Islamic architectural vocabulary (Mosque, Minaret, Mihrab, Muqarnas, Arabesques/Calligraphy) by their function, form, and regional variation, and distinguish Islamic structural elements from decorative features.",
    "lea-hist-004-02": "Distinguish Umayyad (Roman/Byzantine borrowing, hypostyle halls, mosaic decoration) from Abbasid (brick construction, iwan, stucco, centralized planning) Islamic architecture by material, plan, and ornamental vocabulary.",
    "lea-hist-004-05": "Identify the five testable markers of Andalusian Islamic architecture — multiple interconnecting courtyards, horseshoe arches, mashrabiya screens, geometric tilework (zellij), and water features — and recognize key sites (Great Mosque of Cordoba, Alhambra, Giralda).",
    "lea-hist-004-06": "Identify the Ottoman dome system — central dome, four half-domes, pendentives, cascading buttressing — and explain how Sinan achieved the iconic Ottoman silhouette exemplified by the Selimiye and Süleymaniye Mosques.",
    "lea-hist-004-07": "Identify the Mughal synthesis formula — charbagh garden layout, bulbous onion dome, iwan, chhatri, pietra dura inlay — and recognize key monuments (Taj Mahal, Humayun's Tomb, Red Fort, Fatehpur Sikri) by their combination of Persian, Indian, and Islamic elements.",
    "lea-hist-004-08": "Identify the testable markers of Philippine Islamic architecture — wooden construction, vernacular mosque forms, langgal, torogan — and explain how indigenous materials and Southeast Asian traditions shaped the Islamic architecture of Mindanao and Sulu.",
    
    # 007 - Asian & Pacific
    "lea-hist-007-01": "Distinguish the three major Indian architectural traditions — Hindu (shikhara, gopura, garbhagriha), Buddhist (stupa, pradakshina, chaitya), and Mughal (chahar bagh, pietra dura, domed chambers) — by their key structures, spatial organization, materials, and chronological development.",
    "lea-hist-007-02": "Identify the five testable markers of Chinese architecture — dougong bracketing, axial N-S orientation, courtyard organization, modular bay system, and layered/tiered roofs — and explain how geomancy (feng shui) and timber construction shaped the Chinese building tradition.",
    "lea-hist-007-03": "Identify the five testable markers of Japanese architecture — tatami module, shoji/sliding screens, engawa (veranda), tokonoma alcove, and exposed wood joinery — and explain the cultural values (simplicity, transience, connection to nature) embodied in Japanese building design.",
    "lea-hist-007-04": "Distinguish the three major Southeast Asian monuments — Angkor Wat (Khmer, Hindu, sandstone, 12th c.), Borobudur (Sailendra, Buddhist, volcanic stone, 9th c.), and Shwedagon Pagoda (Mon/Burmese, Buddhist, gold stupa) — by period, religion, materials, and spatial organization.",
    "lea-hist-007-05": "Identify the ondol (underfloor heating) system of Korean architecture and explain how it shaped interior planning, social use of space, and the elevated floor culture, and recognize key Korean architectural types (hanok, temple, palace).",
    "lea-hist-007-06": "Identify the four-part formula of Pacific Islands/Oceania architecture — open-sided structures, elevation on pilings, steep roofs, and deep eaves — and explain how these features demonstrate climate-responsive design in tropical island environments.",
    
    # 008 - Modern & Contemporary
    "lea-hist-008-01": "Identify the key 19th-century buildings, movements, and architects — Crystal Palace (Paxton), Arts and Crafts (Morris, Voysey), Chicago School (Sullivan, Jenney) — and explain how industrial materials, design reform, and form follows function transformed architecture from ornament-driven revivalism toward modernism.",
    "lea-hist-008-02": "Distinguish Art Nouveau (flowing organic curves, whiplash lines, natural motifs, Horta, Guimard, Gaudi) from Art Deco (geometric patterns, stepped forms, exotic materials, streamlined shapes) by visual vocabulary, period, and philosophical approach.",
    "lea-hist-008-03a": "Identify Le Corbusier's Five Points of Architecture — pilotis, roof garden, free plan, horizontal window, free facade — and explain how each point enabled a new relationship between structure, enclosure, and interior space, exemplified by Villa Savoye.",
    "lea-hist-008-03b": "Identify Mies van der Rohe's architectural philosophy — 'less is more,' universal space, honest expression of materials — and recognize his major works (Barcelona Pavilion, Farnsworth House, Seagram Building) by their structural clarity and minimalist precision.",
    "lea-hist-008-03c": "Identify Walter Gropius's contributions as founder of the Bauhaus (1919), his belief in uniting art, craft, and industry, and recognize his key works (Fagus Factory, Bauhaus Dessau) by their integration of glass curtain walls, structural honesty, and industrial aesthetic.",
    "lea-hist-008-03d": "Identify Alvar Aalto's humanistic modernism — organic curves, natural materials, human comfort, bent plywood, brick and timber — and recognize his key works (Paimio Sanatorium, Villa Mairea, Finlandia Hall) by their warm materiality and response to human needs.",
    "lea-hist-008-04a": "Trace the Bauhaus's three-director evolution (Gropius 1919–1928, Meyer 1928–1930, Mies 1930–1933), identify the curriculum structure (Vorkurs preliminary course, workshop system), and explain its influence on modern design education worldwide.",
    "lea-hist-008-04b": "Identify the key markers of the International Style — glass curtain walls, structural frame expressed, rejection of ornament, flat roofs, asymmetrical composition — as codified by Hitchcock and Johnson (1932), and recognize its global dissemination through works like the Seagram Building.",
    "lea-hist-008-04c": "Identify the three defining characteristics of De Stijl — primary colors (red, yellow, blue), orthogonal geometry (right angles only), and asymmetrical balance — and explain how the Schröder House (Rietveld, 1924) applied Neoplasticist theory to three-dimensional space.",
    "lea-hist-008-05": "Identify the defining characteristics of Brutalism — exposed béton brut concrete, massive sculptural forms, structural honesty, utopian social ambition — and recognize key examples (Unité d'Habitation, Barbican Centre, Boston City Hall) by their materiality and formal language.",
    "lea-hist-008-06": "Identify the defining characteristics of Postmodernism — historical reference, ornament, color, irony, contextualism, 'less is a bore' — and recognize key architects (Venturi, Graves, Moore, Stirling, Gehry) and works (Vanna Venturi House, Piazza d'Italia, AT&T Building).",
    "lea-hist-008-07a": "Identify the key characteristics of Deconstructivism — fragmentation, non-rectilinear geometry, distorted and displaced forms — and recognize the seven architects featured in the 1988 MoMA exhibition (Gehry, Hadid, Libeskind, Eisenman, Koolhaas, Tschumi, Coop Himmelb(l)au) by their major works.",
    "lea-hist-008-07b": "Identify parametric design as a computational approach where changing a single parameter updates the entire design model, differentiate it from traditional iterative drafting, and recognize its application through Zaha Hadid, Patrik Schumacher, and contemporary digital practice.",
    "lea-hist-008-08": "Identify Critical Regionalism (Frampton, 1983) as the position that modernist rigor must be inflected by local culture, climate, and materials — rejecting both universal modernism and nostalgic vernacular — and recognize architects (Kahn, Barragán, Utzon) who exemplify this approach.",
    "lea-hist-008-09": "Identify the Pritzker Prize laureates and their defining contributions — focus on firsts (first woman: Hadid 2004, first African: Kéré 2022), recent winners (2020–2025), and major shifts in the award's focus from formalist to socially engaged architecture.",
    
    # 011 - African
    "lea-hist-011-01": "Identify the three canonical examples of African pre-colonial architecture — Great Zimbabwe (dry-stone chevron), Lalibela (monolithic rock carving), Djenne Mosque (mud-brick thermal mass) — by their construction technique, date, region, and cultural significance.",
    "lea-hist-011-02": "Distinguish colonial-era African architecture (European imposition, imported styles) from postcolonial approaches (pure modernism, critical regionalism, cultural revival), and identify how African architects negotiate identity through built form.",
    
    # 012 - Pre-Columbian & Indigenous American
    "lea-hist-012-01": "Distinguish Maya architecture (corbelled vaults, astronomy-aligned pyramids, hieroglyphic stairways, Tikal, Palenque) from Aztec architecture (double pyramids, ritual platforms, hydraulic engineering, Tenochtitlán) by their structural systems, urban planning, and symbolic programs.",
    "lea-hist-012-02": "Identify the key characteristics of Inca architecture — ashlar dry-stone masonry, trapezoidal openings, cyclopean walls, batter — and explain the engineering principles behind precisely fitted stonework that enabled earthquake resistance at Machu Picchu and Sacsayhuamán.",
    "lea-hist-012-03": "Identify the three regional traditions of North American Indigenous architecture — Southwest (adobe pueblos), Northeast (longhouses, timber), Midwest (earthworks/mounds) — and explain how each tradition responds to available materials, climate, and cultural/spiritual values.",
    
    # 013 - Latin American
    "lea-hist-013-01": "Identify the three-part formula of Spanish colonial urban design in Latin America — Laws of the Indies grid plan, central plaza, cathedral — and explain how the Leyes de Indias (1573) imposed standardized city layouts across diverse geographies and cultures.",
    "lea-hist-013-02": "Identify the three distinct voices of Latin American modernism — Costa (theory, analysis), Niemeyer (free-form concrete curves, Brasília), Barragán (color, light, walls, water, Mexico) — and recognize their major works and philosophical contributions.",
    
    # 014 - United States
    "lea-hist-014-01": "Identify the four regional traditions of American colonial architecture — New England (timber, chimney, saltbox), Mid-Atlantic (brick, symmetry, Georgian), Dutch (gambrel roof, stone), Spanish/Southwest (coquina, adobe, mission) — by material, climate, and cultural origin.",
    "lea-hist-014-02": "Identify the four-part structural system of the skyscraper — steel frame carries load, curtain wall hangs, elevator enables vertical rise, piers express height — and trace its evolution from the Home Insurance Building (1885) to the Woolworth and Chrysler Buildings.",
    "lea-hist-014-03": "Identify Beaux-Arts architecture as a compositional methodology (axis, symmetry, monumentality, hierarchy, classical vocabulary) rather than a style, and recognize key works (NY Public Library, Grand Central Terminal, US Supreme Court) by their urban and formal logic.",
    "lea-hist-014-04": "Identify Frank Lloyd Wright's organic architecture philosophy — building grows from site, open plan, horizontal emphasis, natural materials, destruction of the box — and recognize his major works (Fallingwater, Robie House, Guggenheim Museum, Taliesin) by their spatial innovation.",
    "lea-hist-014-05": "Identify the International Style in the United States — glass and steel towers, universal space, curtain wall, rejection of ornament — as exemplified by Mies van der Rohe (Lake Shore Drive, Seagram) and its influence on postwar corporate architecture.",
    
    # 015 - Australia & NZ
    "lea-hist-015-01": "Identify Indigenous Australian architecture (climate-responsive, ephemeral, bark shelters, windbreaks) and contrast it with colonial imported styles, explaining how climate, materials, and cultural values shaped distinct building traditions.",
    "lea-hist-015-02": "Identify Jørn Utzon's Sydney Opera House as a structural and sculptural masterpiece — spherical shell geometry, prefabricated tile ribs, harbor site response — and explain how the design reconciled modernist expression with contextual sensitivity.",
    "lea-hist-015-03": "Identify the three traditional Maori building types — whare (domestic), wharenui (meeting house), pā (fortified settlement) — by their social function, spatial organization, and carved ornamentation, and explain their cultural and cosmological significance.",
}

THEO_GOALS = {
    # 001 - Nature of Architecture
    "lea-theo-001-01": "Explain how architecture uniquely integrates artistic vision, scientific precision, and social responsibility as simultaneous and inseparable requirements of design, using Vitruvius's triad (firmitas, utilitas, venustas) as the foundational framework.",
    "lea-theo-001-07": "Identify the systematic progression of the architectural design process — pre-design, schematic design, design development, contract documents, bidding, construction — and explain the purpose, deliverables, and architect's role at each phase.",
    "lea-theo-001-08": "Explain architecture as cultural expression — how buildings embody values, beliefs, and identity of societies — and analyze how cultural context shapes form, material, and spatial organization across different traditions.",
    "lea-theo-001-09": "Identify and explain the Vitruvian Triad — firmitas (strength), utilitas (function), venustas (beauty) — as the foundational framework for architectural quality, and apply it to analyze how design decisions satisfy all three simultaneously.",
    "lea-theo-001-10": "Identify Francis D.K. Ching's hierarchy of primary architectural elements — point, line, plane, volume — and explain how these fundamental elements combine and transform to create architectural form and space.",
    "lea-theo-001-11": "Explain the relationships among space, form, and order as fundamental organizing concepts in architectural design, and identify how spatial enclosure, form articulation, and ordering principles create coherent architectural compositions.",
    "lea-theo-001-12": "Explain how buildings communicate meaning beyond function through architectural language, signs, symbols, and semiotic systems, and identify how form, material, and spatial sequences convey cultural and conceptual content.",
    "lea-theo-001-13": "Explain the architect's social and ethical responsibilities — beyond client and structural integrity — including public safety, environmental stewardship, cultural respect, and commitment to human dignity and community welfare.",
    
    # 002 - Elements & Principles
    "lea-theo-002-01": "Identify the primary architectural elements — walls, roofs, columns, beams, openings, floors, stairs — and explain how each element serves specific human needs while contributing to structural integrity and spatial experience.",
    "lea-theo-002-02": "Identify and apply the six basic principles of design — contrast, rhythm, proportion, balance, scale, and character — to architectural composition analysis and explain how each principle shapes spatial perception and formal coherence.",
    "lea-theo-002-03": "Identify axis, symmetry, and transformation as compositional strategies that organize architectural forms and spaces, and explain how these strategies create hierarchy, sequence, and experiential order in architectural design.",
    "lea-theo-002-04": "Identify the organizing principles of architectural composition — unity, hierarchy, datum, rhythm, repetition, transformation — and explain how architects use them to cluster, arrange, and structure multiple forms into coherent systems.",
    "lea-theo-002-05": "Identify form transformation operations — subtraction, addition, dimensional alteration, subtraction, additive, subtractive, and volumetric manipulation — and explain how basic geometric forms are modified to create complex architectural configurations.",
    "lea-theo-002-06": "Identify the five types of spatial organization — centralized, linear, radial, clustered, and grid — and explain how each arrangement supports different functional programs, circulation patterns, and experiential qualities.",
    "lea-theo-002-07": "Identify the basic building elements — walls, columns, beams, floor/roof slabs, openings, stairs — and explain their structural behavior, material expression, and role in defining architectural space.",
    "lea-theo-002-08": "Identify the major proportioning systems — golden section, modular, classical orders, Renaissance harmonic proportions Le Corbusier's Modulor — and explain how mathematical and geometric frameworks generate harmonious spatial relationships.",
    "lea-theo-002-09": "Identify and explain how color, texture, light, and shadow function as sensory design elements that fundamentally affect spatial perception, emotional response, and the experience of architectural form.",
    
    # 003 - Perception
    "lea-theo-003-01": "Distinguish the three major anthropometric systems (Neufert, Dreyfuss, Modulor) by their approach and application, and recall standard human dimensions (door heights, passage widths, counter heights, eye levels) for design application.",
    "lea-theo-003-02": "Identify Edward T. Hall's four proxemic zones — intimate (0-0.45m), personal (0.45-1.2m), social (1.2-3.6m), public (3.6m+) — and explain how these invisible spatial boundaries shape design decisions for different functional settings.",
    "lea-theo-003-03": "Explain kinesthetics as the study of the body in motion through space, and identify how architectural sequences — approach, entry, progression, destination — choreograph movement and create spatial narratives.",
    "lea-theo-003-04": "Explain biophilic design principles and how humans respond psychologically to spatial environments, including the restorative effects of nature views, natural light, natural materials, and spatial variety on well-being and performance.",
    "lea-theo-003-05": "Explain how to design for multi-sensory experience — engaging vision, hearing, touch, smell, and proprioception — and identify specific design strategies for sensory richness (daylighting, acoustics, texture, scent, thermal variation) in architecture.",
    "lea-theo-003-06": "Identify and apply Ron Mace's 7 Principles of Universal Design — equitable use, flexibility, simple/intuitive, perceptible information, tolerance for error, low physical effort, size/space for approach — to architectural scenarios on the LEA.",
    "lea-theo-003-07": "Explain how spatial perception, proxemic zones, and design preferences vary across cultures, and identify culturally-specific spatial expectations, territorial behaviors, and design implications for cross-cultural architectural practice.",
    "lea-theo-003-08": "Identify and apply the five Gestalt principles of visual perception — proximity, similarity, continuity, closure, figure-ground — and explain how each principle affects how architectural forms are perceived, grouped, and understood.",
    "lea-theo-003-09": "Identify Kevin Lynch's five elements of urban legibility — paths, edges, districts, nodes, landmarks — from The Image of the City (1960), and explain how each element contributes to people's mental maps and wayfinding in urban environments.",
    
    # 004 - Tropical / Climate
    "lea-theo-004-01": "Explain the Philippines' tropical maritime climate context — latitude 5-20°N, Pacific Typhoon Belt, monsoon wind patterns, high humidity, solar radiation — and identify the climatic factors that drive architectural design decisions in the tropics.",
    "lea-theo-004-02": "Identify the core principles of tropical passive design — prioritize ventilation over thermal mass, shading over orientation, lightweight construction — and explain how these principles respond to the specific climatic challenges of the Philippines.",
    "lea-theo-004-03": "Distinguish the two primary Philippine green building frameworks — BERDE (Philippine national standard) and EDGE (World Bank IFC tool) — by their certification levels, assessment criteria, and applicability to different project types.",
    "lea-theo-004-07": "Identify the biophilic design patterns — direct nature experience, indirect nature experience, space and place — and explain how each pattern enhances occupant well-being, cognitive performance, and connection to the natural environment in buildings.",
    "lea-theo-004-08": "Explain how Philippine latitude (5-20°N) determines solar altitude angles by season, and apply sun path analysis to design shading devices, orient buildings, position openings, and control solar heat gain in tropical architecture.",
    "lea-theo-004-09": "Explain the principles of natural ventilation — cross-ventilation, stack effect, monsoon wind patterns, prevailing wind orientation — and identify design strategies (operable windows, wind scoops, wing walls, clerestories) that drive air movement in tropical buildings.",
    "lea-theo-004-10": "Explain how the bahay kubo (elevated floor, steep roof, wide eaves, permeable walls) and bahay na bato (stone ground floor, timber upper floor, capiz windows) represent centuries of indigenous climate adaptation in Philippine vernacular architecture.",
    "lea-theo-004-12": "Apply ASHRAE 55 thermal comfort standards — including the adaptive comfort model for naturally ventilated buildings — to Philippine conditions, and identify the factors (temperature, humidity, air speed, clothing, activity) that define thermal comfort.",
    "lea-theo-004-13": "Design sun shading devices for tropical buildings — horizontal overhangs, vertical fins, egg-crate screens, louver systems — and calculate how each device type reduces solar heat gain by 40-70% while maintaining adequate daylighting.",
    
    # 005 - Philosophies
    "lea-theo-005-01": "Identify the foundational classical architectural theories — Vitruvius's triad, the classical orders, Pythagorean proportion, the golden section — and explain their influence on Western architectural theory from antiquity through the Renaissance.",
    "lea-theo-005-02": "Identify the philosophical positions of the major Modernist masters — Le Corbusier (machines for living, Five Points), Wright (organic architecture), Mies (less is more, universal space), Aalto (humanistic modernism), Kahn (silence and light) — by their key concepts and built works.",
    "lea-theo-005-04": "Identify the canonical texts of architectural theory — Vitruvius (De architectura), Alberti (De re aedificatoria), Palladio (Quattro Libri), Le Corbusier (Towards an Architecture), Venturi (Complexity and Contradiction) — by their authors, central arguments, and historical significance.",
    "lea-theo-005-05": "Explain Postmodernism's critique of Modernism — reintroducing historical reference, ornament, symbolism, complexity, and contradiction — and identify key architects (Venturi, Moore, Graves, Stirling) and their theoretical positions and built works.",
    "lea-theo-005-08": "Explain architectural phenomenology as the philosophical focus on lived embodied experience, sensory perception, and the poetics of space, and identify key thinkers (Pallasmaa, Zumthor, Norberg-Schulz) and their concepts of place, atmosphere, and dwelling.",
    "lea-theo-005-09": "Identify Kenneth Frampton's Critical Regionalism (1983) as a theory that seeks inflected modernism — modernist rigor tempered by local climate, culture, topography, and tectonics — and recognize architects (Kahn, Barragán, Utzon, Siza) who exemplify this approach.",
    "lea-theo-005-10": "Explain how structuralism and semiotics provided architectural theory with frameworks for understanding buildings as signifying systems, and identify key concepts — langue/parole, signifier/signified — as applied by theorists like Eco, Jencks, and Broadbent.",
    "lea-theo-005-11": "Explain how feminist and postcolonial perspectives challenge the traditional architectural canon by revealing how gender, race, class, and colonial power structures have shaped who builds, who designs, and whose architecture is valued and remembered.",
    
    # 006 - Pritzker
    "lea-theo-006-04": "Identify Pritzker Prize laureates and their defining contributions — firsts (Hadid 2004, Aravena 2016, Kéré 2022, Riken Yamamoto 2024), recent trends (social engagement, sustainability), and signature works — for recognition-based LEA questions.",
    
    # 007 - Movements & Contemporary
    "lea-theo-007-01": "Identify the major 20th-century architectural movements — Expressionism, Constructivism, Futurism, Bauhaus, International Style, Organic, Metabolism, Brutalism — by their core ideas, formal characteristics, key architects, and chronological sequence.",
    "lea-theo-007-02": "Identify the key themes of contemporary architectural discourse — digital design, data-responsive systems, biomimicry, computational design, AI integration, sustainability, social equity — and explain how each is transforming architectural practice.",
    "lea-theo-007-09": "Identify the key sustainable architecture certification systems — BERDE, LEED, EDGE, WELL, Passive House — by their assessment criteria, certification levels, and focus areas, and explain how sustainability has evolved from elective to systematic methodology.",
    "lea-theo-007-10": "Explain social architecture as a participatory design approach that reorients the architect from top-down expert to community collaborator, and identify key practices — co-design, community workshops, participatory budgeting — that empower end-users in the design process.",
    "lea-theo-007-11": "Explain architectural minimalism as a rigorous disciplinary framework where every element is justified by necessity, and distinguish genuine minimalism from mere simplicity or absence by analyzing works of Mies, Ando, Pawson, and Siza.",
    "lea-theo-007-12": "Identify High-Tech architecture as the celebration of structural and mechanical systems as architectural expression — exposed structure, active services, industrial materials — and recognize key works (Pompidou Center, Lloyd's Building, Hong Kong & Shanghai Bank) by their technological emphasis.",
    "lea-theo-007-13": "Explain how vernacular architecture embodies accumulated cultural wisdom about climate, materials, and social organization — without formal architects — and identify principles from vernacular traditions that inform contemporary sustainable and climate-responsive design.",
    "lea-theo-007-14": "Explain adaptive reuse as the practice of converting existing buildings to new functions — addressing sustainability by avoiding demolition, preserving embodied energy and cultural memory — and identify strategies (shell retention, infill, addition, loft conversion) by their approach.",
    
    # 008 - Innovation & Identity
    "lea-theo-008-02": "Explain spatial justice as the principle that architecture and urban design must actively address social inequalities by making space equitable, accessible, and inclusive for all communities regardless of income, ability, race, or gender.",
    "lea-theo-008-03": "Identify how computational tools, AI, virtual reality, BIM, and digital fabrication are transforming architectural design, construction, and communication, and explain the implications of digital architecture for the profession and design process.",
    "lea-theo-008-04": "Explain the ongoing search for Filipino architectural identity — from Juan Nakpil and Pablo Antonio to contemporary practice — and identify how architects negotiate the tension between global modernity and local cultural expression in the Philippine context.",
    "lea-theo-008-08": "Identify how Philippine design identity extends beyond architecture to furniture, industrial design, interior design, and urban spaces, and recognize key Filipino designers and their contributions to a distinct national aesthetic.",
    
    # 009 - Space Planning
    "lea-theo-009-01": "Explain architectural programming as the systematic process of translating client needs, organizational goals, and functional requirements into a spatial strategy, and apply programming methods (interviews, observation, adjacency analysis) to design scenarios.",
    "lea-theo-009-02": "Apply bubble diagrams as analytical tools to graphically represent spatial relationships, functional adjacencies, circulation patterns, and zoning logic derived from architectural programming analysis.",
    "lea-theo-009-03": "Apply standard minimum dimensions and area allocations for common room types — offices, classrooms, hospital rooms, hotel guestrooms, retail spaces, restaurants, residential units — as the quantitative foundation for space programming and design.",
    "lea-theo-009-04": "Organize building space through functional zoning — separating areas into public, semi-public, semi-private, and private zones — and identify strategies for adjacency optimization, circulation efficiency, and user experience in multi-zone buildings.",
    "lea-theo-009-05": "Identify the programming and zoning challenges of mixed-use buildings that combine two or more distinct program types (retail, office, residential, hotel, parking), and explain strategies for vertical stacking, common core sharing, and separate access in mixed-use design.",
}

# ── Article mapping (slug prefix -> (HA goal key, THEO goal key)) ────────
# For cross-references

HIST_GROUPS = {
    "001": {"name": "Ancient Architecture", "articles": ["001-01", "001-02", "001-03", "001-04", "001-05", "001-06", "001-08"]},
    "002": {"name": "Medieval to Baroque", "articles": ["002-01", "002-02", "002-03", "002-04", "002-05", "002-06"]},
    "004": {"name": "Islamic Architecture", "articles": ["004-01", "004-02", "004-05", "004-06", "004-07", "004-08"]},
    "007": {"name": "Asian & Pacific Architecture", "articles": ["007-01", "007-02", "007-03", "007-04", "007-05", "007-06"]},
    "008": {"name": "Modern & Contemporary Architecture", "articles": ["008-01", "008-02", "008-03a", "008-03b", "008-03c", "008-03d", "008-04a", "008-04b", "008-04c", "008-05", "008-06", "008-07a", "008-07b", "008-08", "008-09"]},
    "011": {"name": "African Architecture", "articles": ["011-01", "011-02"]},
    "012": {"name": "Pre-Columbian & Indigenous American Architecture", "articles": ["012-01", "012-02", "012-03"]},
    "013": {"name": "Latin American Architecture", "articles": ["013-01", "013-02"]},
    "014": {"name": "United States Architecture", "articles": ["014-01", "014-02", "014-03", "014-04", "014-05"]},
    "015": {"name": "Australia & New Zealand Architecture", "articles": ["015-01", "015-02", "015-03"]},
}

THEO_GROUPS = {
    "001": {"name": "Nature of Architecture", "articles": ["001-01", "001-07", "001-08", "001-09", "001-10", "001-11", "001-12", "001-13"]},
    "002": {"name": "Elements & Principles of Design", "articles": ["002-01", "002-02", "002-03", "002-04", "002-05", "002-06", "002-07", "002-08", "002-09"]},
    "003": {"name": "Design Perception", "articles": ["003-01", "003-02", "003-03", "003-04", "003-05", "003-06", "003-07", "003-08", "003-09"]},
    "004": {"name": "Tropical Architecture & Climate", "articles": ["004-01", "004-02", "004-03", "004-07", "004-08", "004-09", "004-10", "004-12", "004-13"]},
    "005": {"name": "Architectural Philosophies", "articles": ["005-01", "005-02", "005-04", "005-05", "005-08", "005-09", "005-10", "005-11"]},
    "006": {"name": "Pritzker Prize", "articles": ["006-04"]},
    "007": {"name": "Contemporary Movements & Discourse", "articles": ["007-01", "007-02", "007-09", "007-10", "007-11", "007-12", "007-13", "007-14"]},
    "008": {"name": "Innovation & Filipino Identity", "articles": ["008-02", "008-03", "008-04", "008-08"]},
    "009": {"name": "Space Planning Theory", "articles": ["009-01", "009-02", "009-03", "009-04", "009-05"]},
}

# ── Utility functions ────────────────────────────────────────────────────

def sha256(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def get_cross_references(slug, is_history):
    """Generate cross-reference string from a slug's group members."""
    parts = slug.replace("lea-hist-", "").replace("lea-theo-", "").replace("-core-concept", "")
    
    # Extract major group (e.g., "001" from "001-05" or "008" from "008-03a")
    group_match = re.match(r'(\d{3})', parts)
    if not group_match:
        return ""
    
    group_num = group_match.group(1)
    this_article = parts
    
    groups = HIST_GROUPS if is_history else THEO_GROUPS
    prefix = "lea-hist-" if is_history else "lea-theo-"
    
    if group_num not in groups:
        return ""
    
    group = groups[group_num]
    others = [a for a in group["articles"] if a != this_article]
    
    if not others:
        return ""
    
    # Only show first 4 related articles max
    others = others[:4]
    
    refs = []
    for art in others:
        ref_slug = f"{prefix}{art}-core-concept"
        refs.append(f"**{ref_slug}**")
    
    topic = group["name"]
    result = f"\n\n## Related Articles\n\nSee also within {topic}: {', '.join(refs)}.\n"
    
    # Add cross-reference to overview article
    if is_history:
        result += "\n> **Overview:** See overview-history-of-architecture for the full curriculum structure and study strategy for History of Architecture.\n"
    else:
        result += "\n> **Overview:** See overview-theory-of-architecture for the full curriculum structure and study strategy for Theory of Architecture.\n"
    
    return result


def add_examtip_if_missing(content, article_topic):
    """Add an ExamTip component if the article has fewer than 2 already."""
    examtip_count = len(re.findall(r'component="ExamTip"', content))
    
    if examtip_count >= 1:
        return content  # Already has at least one ExamTip
    
    # Basic tip based on topic
    tip_text = f"**ALE Exam Pattern:** Questions on {article_topic} typically require you to identify key characteristics, distinguish related concepts, or match buildings to their architects and periods. Practice active recall by covering the description and recalling the term."
    
    examtip_block = f"""
[SLATECAMP_UI_BLOCK:ui_e001 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: {tip_text}
[/SLATECAMP_UI_BLOCK]
"""
    
    # Insert before "## Common Mistakes" or at the end of the How It's Tested section
    # Find the last occurrence of an ExamTip block, insert after it
    last_examtip = list(re.finditer(r'\[/SLATECAMP_UI_BLOCK\]\s*\n', content))
    insertion_point = None
    
    for m in re.finditer(r'## (?:How It.s Tested|Key Facts)', content):
        insertion_point = m.start()
    
    if insertion_point:
        content = content[:insertion_point] + examtip_block + "\n\n" + content[insertion_point:]
    
    return content


def fix_article(dirname):
    """Process a single article directory."""
    slug = dirname.split('--')[0]
    
    # Determine if history or theory
    is_history = slug.startswith("lea-hist-")
    is_theory = slug.startswith("lea-theo-")
    
    if not is_history and not is_theory:
        return None
    
    article_dir = os.path.join(BASE, dirname)
    norm_path = os.path.join(article_dir, "normalized.md")
    ui_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path):
        print(f"  SKIP: {slug} - no normalized.md")
        return None
    
    content = read(norm_path)
    original_content = content
    changes = []
    
    # ── 1. Remove "After reading this article, you should be able to:" ──
    if "After reading this article, you should be able to:" in content:
        # Remove the AI commentary header and convert to clean bullet list
        patterns = [
            (r'After reading this article, you should be able to:\s*\n', ''),
        ]
        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                content = new_content
                changes.append("Removed 'After reading this article' AI commentary")
                break
    
    # ── 2. Replace generic Learning Goals ──
    # First, identify the correct goal based on the slug
    goals_map = HIST_GOALS if is_history else THEO_GOALS
    
    # Try to match slug to a goal key
    goal_key = None
    for key in goals_map:
        if slug.startswith(key):
            goal_key = key
            break
    
    if goal_key is None:
        # Try shorter match
        for key in goals_map:
            if slug.startswith(key[:15]):
                goal_key = key
                break
    
    if goal_key:
        new_goal = goals_map[goal_key]
        
        # Find the Learning Goal section
        goal_pattern = r'## Learning Goal\s*\n(.*?)(?=\n## |\Z)'
        goal_match = re.search(goal_pattern, content, re.DOTALL)
        
        if goal_match:
            existing_goal = goal_match.group(1).strip()
            
            # Check if the current goal is generic boilerplate
            is_generic = (
                'Identify major architectural periods' in existing_goal or
                'Identify major architectural periods' in existing_goal or
                existing_goal.startswith('After reading') or
                existing_goal.startswith('- Identify major') or
                'from ancient through contemporary' in existing_goal
            )
            
            # Also check if the goal is just a single simple sentence (too generic)
            if is_generic:
                # Replace with specific goal
                new_header = f"## Learning Goal\n\n{new_goal}"
                content = content.replace(goal_match.group(0), new_header)
                changes.append(f"Replaced generic learning goal with specific goal for {goal_key}")
            elif existing_goal != new_goal:
                # Goal exists but is different - check if current is too vague
                words_existing = len(existing_goal.split())
                words_new = len(new_goal.split())
                
                # If existing is much shorter/more vague, upgrade it
                if words_existing < 15 and words_new > 15:
                    new_header = f"## Learning Goal\n\n{new_goal}"
                    content = content.replace(goal_match.group(0), new_header)
                    changes.append(f"Upgraded vague learning goal for {goal_key}")
    
    # ── 3. Add cross-references if missing ──
    if "## Related Articles" not in content and "## Related" not in content:
        # Don't add to overview/mastery articles
        if 'overview' not in slug and 'mastery' not in slug:
            xref = get_cross_references(slug, is_history)
            if xref:
                # Insert before the last section (usually Key Terms) or at end
                last_section = list(re.finditer(r'^## ', content, re.MULTILINE))
                if last_section:
                    # Insert at end of article
                    content = content.rstrip() + xref + "\n"
                    changes.append("Added cross-references to related articles")
    
    # ── 4. Add missing ExamTip ──
    topic = slug.replace("lea-hist-", "").replace("lea-theo-", "").replace("-core-concept", "")
    if topic in goals_map:
        short_topic = goals_map[topic][:60]
    else:
        short_topic = slug
    
    content = add_examtip_if_missing(content, short_topic)
    # Only track if we actually added one
    if "ExamTip" in content and content.count('component="ExamTip"') > original_content.count('component="ExamTip"'):
        changes.append("Added missing ExamTip component")
    
    # ── 5. Save changes if any ──
    if content != original_content:
        write(norm_path, content)
        print(f"  CHANGED: {slug} - {', '.join(changes)}")
        return article_dir
    else:
        print(f"  OK: {slug} - no changes needed")
        return None


def update_ui_block_hash(article_dir):
    """Update normalized_content_hash in ui-blocks.json based on current normalized.md."""
    norm_path = os.path.join(article_dir, "normalized.md")
    ui_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path) or not os.path.exists(ui_path):
        return False
    
    content = read(norm_path)
    new_hash = sha256(content)
    
    ui_data = json.loads(read(ui_path))
    old_hash = ui_data.get("normalized_content_hash", "")
    
    if old_hash != new_hash:
        ui_data["normalized_content_hash"] = new_hash
        write(ui_path, json.dumps(ui_data, indent=2) + "\n")
        slug = ui_data.get("slug", "unknown")
        print(f"  HASH UPDATED: {slug}: {old_hash[:12]}... -> {new_hash[:12]}...")
        return True
    
    return False


def process_batch(article_dirs, batch_name):
    """Process a batch of articles."""
    print(f"\n{'='*60}")
    print(f"BATCH: {batch_name}")
    print(f"{'='*60}")
    
    changed_dirs = []
    for d in article_dirs:
        try:
            result = fix_article(d)
            if result:
                changed_dirs.append(result)
        except Exception as e:
            print(f"  ERROR: {d}: {e}")
    
    # Update hashes for changed articles
    print(f"\n--- Updating hashes for {batch_name} ---")
    for d in changed_dirs:
        try:
            update_ui_block_hash(d)
        except Exception as e:
            print(f"  HASH ERROR: {d}: {e}")
    
    return len(changed_dirs)


def main():
    """Main entry point - process all 116 articles in batches."""
    # Collect all history and theory article directories
    all_dirs = sorted(os.listdir(BASE))
    
    hist_dirs = [d for d in all_dirs if d.startswith("lea-hist-") and os.path.isdir(os.path.join(BASE, d))]
    theo_dirs = [d for d in all_dirs if d.startswith("lea-theo-") and os.path.isdir(os.path.join(BASE, d))]
    
    print(f"Found {len(hist_dirs)} History articles and {len(theo_dirs)} Theory articles")
    
    # Process in batches of ~15
    batch_size = 18  # 15-20 range
    
    total_changed = 0
    
    # History batches
    for i in range(0, len(hist_dirs), batch_size):
        batch = hist_dirs[i:i+batch_size]
        batch_num = i // batch_size + 1
        count = process_batch(batch, f"History Batch {batch_num} ({len(batch)} articles)")
        total_changed += count
    
    # Theory batches
    for i in range(0, len(theo_dirs), batch_size):
        batch = theo_dirs[i:i+batch_size]
        batch_num = i // batch_size + 1
        count = process_batch(batch, f"Theory Batch {batch_num} ({len(batch)} articles)")
        total_changed += count
    
    print(f"\n{'='*60}")
    print(f"COMPLETE: {total_changed} articles modified out of {len(hist_dirs) + len(theo_dirs)} total")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
