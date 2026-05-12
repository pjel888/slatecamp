# Source-Audited Article Batch 074 Local-First Report

Generated: 2026-05-12T02:19:20.708+08:00

## Summary

- Mode: local-first source-audited continuation
- Supabase/deploy/commit: not performed
- Completed articles: 5
- Linked question edits: 50
- Unresolved blockers: 0
- Next readiness: Batch 075 may start from this local state if continuing.

## Completed Articles

| Article ID | Slug | Question edits | Sources | Scenario status |
| --- | --- | ---: | ---: | --- |
| 7c0e2fa5-7f3d-419a-b592-50346ac7ab2f | lea-plan-003-02-what-you-need-to-know-for-the-lea | 10 | 4 | eligible-deferred |
| c684727d-d3e3-4303-b213-590c4b8ab766 | lea-plan-003-04-core-concept | 10 | 3 | eligible-deferred |
| ac9af0bb-dcf3-4a02-b409-d19bca68e514 | lea-plan-003-05-core-concept | 10 | 3 | eligible-deferred |
| 6a351c32-f48d-45fb-93f5-e60e6cd271c5 | lea-plan-004-01-what-you-need-to-know-for-the-lea | 10 | 5 | eligible-deferred |
| f5374d6a-fc70-475e-83ce-7feb64056655 | lea-plan-005-01-what-you-need-to-know-for-the-lea | 10 | 6 | eligible-deferred |

## Validation Evidence

- Compose: PASS, blockers=0
- Diff: PASS, safe_to_push=true for all five local candidates
- Validate: PASS, blockers=0; five expected component-usage warnings only
- UI block edit validation: PASS, blockers=0
- Source-audit apply gate: PASS, blockers=0
- Scoped JSON parse: PASS, parsed files=105, failures=0
- Marker/internal-note/source-gap scan: PASS, scanned files=85, hits=0
- Source hash check: PASS, checked source instances=21
- Question edit count check: PASS, expected=50, actual=50
- Stale compose-error check: PASS, stale files=0
- Targeted tests: PASS, 34 tests, 0 failures, 328 expectations
- Scoped git diff check: PASS

## Source Evidence

### lea-plan-003-02-what-you-need-to-know-for-the-lea

- Revised IRR of BP 220, 2008: vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf; BP 220 refined markdown lines 105-147, 151-195, 215-264, 420-465, and 482-504; raw PDF pages 5-6, 8-10, and 12 checked by local PyMuPDF extraction; raw=sha256:7392741260c227647afe39de283f3efa979465692da8905e59be8857c8651614; refined=sha256:4d66a5ce3891d6405324d52ae8b874f75321da0e5f00213489be43d754d27be1
- PD 957 IRR - Subdivision and Condominium Buyers Protective Decree: vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-957/PD 957 IRR - Subdivision and Condominium IRR.pdf; PD 957 refined markdown lines 105-123, 129-177, 198-224, 358-405, and 470-512; raw PDF pages 6-7 and 11-14 checked by local PyMuPDF extraction; raw=sha256:1f9ab17a816885cfdbafafc03e3e9b64470a737447129a32a459836d6773f9ea; refined=sha256:0edd45f5293044779c45c36e5219904d3863cfa747d200864959fc1bf6a9ff7b
- RA 7279 Urban Development and Housing Act: vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-7279/RA 7279 Urban Development and Housing Act 2009.pdf; RA 7279 refined markdown lines 13-85, 111-131, 230-253, 257-313, and 319-329; raw PDF pages 1-7 checked by local PyMuPDF extraction; raw=sha256:23efa9c0278519d79ed424d9ced016b24619ebb42a19e75a05dc9bb8bf1c4696; refined=sha256:f52859fb18fec28c403348851c3e53caca2e678cb9cec43fbca28d8d5c3a323e
- RA 11201 IRR - DHSUD Act Implementing Rules: vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-11201/RA 11201 IRR - DHSUD Act Implementing Rules.pdf; RA 11201 IRR refined markdown lines 17-36, 40-99, 134-162, and 187-204; raw PDF pages 1-7 checked by local PyMuPDF extraction; raw=sha256:44705e2f0e700b9287afad08e4c32548679bb04d9a98b652431d05e0a7f2e171; refined=sha256:40f1a5041c69b3a4aea7c8ba138a9d570bc686bea48aa5618ea6423a6a719528

### lea-plan-003-04-core-concept

- RA 7279 Urban Development and Housing Act: vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-7279/RA 7279 Urban Development and Housing Act 2009.pdf; RA 7279 refined markdown lines 13-85, 111-131, 230-253, 257-313, and 319-329; raw PDF pages 1-7 checked by local PyMuPDF extraction; raw=sha256:23efa9c0278519d79ed424d9ced016b24619ebb42a19e75a05dc9bb8bf1c4696; refined=sha256:f52859fb18fec28c403348851c3e53caca2e678cb9cec43fbca28d8d5c3a323e
- Local Shelter Planning Manual, 2016 Web Edition: vitruvius-connection/001_Raw-Source-Layer/001-Laws/HLURB-DHSUD/Local-Shelter-Planning-Manual-2016-Web-Edition.pdf; Local Shelter Planning Manual refined markdown lines 17-25, 37-45, 61-63, 303-384, 761-790, and 805-819; raw PDF pages 3, 5, 8-9, 12-13, and related planning-table pages checked by local PyMuPDF extraction; raw=sha256:c8dd5e9492a17cdd4c2fb05d21564eee75b8def86e9f8bb8052b71adf15edcec; refined=sha256:e94d42b03c750a104eb24daaf60e3f616c55c301af6d4be9b7aede5f1004794b
- RA 11201 IRR - DHSUD Act Implementing Rules: vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-11201/RA 11201 IRR - DHSUD Act Implementing Rules.pdf; RA 11201 IRR refined markdown lines 17-36, 40-99, 134-162, and 187-204; raw PDF pages 1-7 checked by local PyMuPDF extraction; raw=sha256:44705e2f0e700b9287afad08e4c32548679bb04d9a98b652431d05e0a7f2e171; refined=sha256:40f1a5041c69b3a4aea7c8ba138a9d570bc686bea48aa5618ea6423a6a719528

### lea-plan-003-05-core-concept

- RA 11201 IRR - DHSUD Act Implementing Rules: vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-11201/RA 11201 IRR - DHSUD Act Implementing Rules.pdf; RA 11201 IRR refined markdown lines 17-36, 40-99, 134-162, and 187-204; raw PDF pages 1-7 checked by local PyMuPDF extraction; raw=sha256:44705e2f0e700b9287afad08e4c32548679bb04d9a98b652431d05e0a7f2e171; refined=sha256:40f1a5041c69b3a4aea7c8ba138a9d570bc686bea48aa5618ea6423a6a719528
- RA 7279 Urban Development and Housing Act: vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-7279/RA 7279 Urban Development and Housing Act 2009.pdf; RA 7279 refined markdown lines 13-85, 111-131, 230-253, 257-313, and 319-329; raw PDF pages 1-7 checked by local PyMuPDF extraction; raw=sha256:23efa9c0278519d79ed424d9ced016b24619ebb42a19e75a05dc9bb8bf1c4696; refined=sha256:f52859fb18fec28c403348851c3e53caca2e678cb9cec43fbca28d8d5c3a323e
- Local Shelter Planning Manual, 2016 Web Edition: vitruvius-connection/001_Raw-Source-Layer/001-Laws/HLURB-DHSUD/Local-Shelter-Planning-Manual-2016-Web-Edition.pdf; Local Shelter Planning Manual refined markdown lines 17-25, 37-45, 61-63, 303-384, 761-790, and 805-819; raw PDF pages 3, 5, 8-9, 12-13, and related planning-table pages checked by local PyMuPDF extraction; raw=sha256:c8dd5e9492a17cdd4c2fb05d21564eee75b8def86e9f8bb8052b71adf15edcec; refined=sha256:e94d42b03c750a104eb24daaf60e3f616c55c301af6d4be9b7aede5f1004794b

### lea-plan-004-01-what-you-need-to-know-for-the-lea

- Building Construction Illustrated, 5th Edition: vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf; BCI refined markdown lines 245-288, 333-370, 407-455, 483-508, and 1328-1340; raw PDF pages 11-12, 17-18, and 20-21 checked by local PyMuPDF extraction; raw=sha256:528acdc8afd84d937d5ab49a5df8c349321d20d3d403d110e038628e4d2f1c02; refined=sha256:0f3213a3ca3dcf8fd2076dae5e1b12a215dc7041950f864cfd5f4b53250c820a
- Revised IRR of BP 220, 2008: vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf; BP 220 refined markdown lines 105-147, 151-195, 215-264, 420-465, and 482-504; raw PDF pages 5-6, 8-10, and 12 checked by local PyMuPDF extraction; raw=sha256:7392741260c227647afe39de283f3efa979465692da8905e59be8857c8651614; refined=sha256:4d66a5ce3891d6405324d52ae8b874f75321da0e5f00213489be43d754d27be1
- PD 957 IRR - Subdivision and Condominium Buyers Protective Decree: vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-957/PD 957 IRR - Subdivision and Condominium IRR.pdf; PD 957 refined markdown lines 105-123, 129-177, 198-224, 358-405, and 470-512; raw PDF pages 6-7 and 11-14 checked by local PyMuPDF extraction; raw=sha256:1f9ab17a816885cfdbafafc03e3e9b64470a737447129a32a459836d6773f9ea; refined=sha256:0edd45f5293044779c45c36e5219904d3863cfa747d200864959fc1bf6a9ff7b
- DOE Guidelines on Energy Conserving Design of Buildings, 2008: vitruvius-connection/001_Raw-Source-Layer/001-Laws/DOE/DOE Guidelines on Energy Conserving Design on Buildings v2008.pdf; DOE Guidelines refined markdown lines 717-795, 1429-1450, and 1533-1537; raw PDF pages 33, 35-36, 39-40, and 42 checked by local PyMuPDF extraction; raw=sha256:9a1a4019b500ffc2873625db6f04ac50b39aea7cadac9159464f9ed716e8126c; refined=sha256:477f0990a67359eee303e8280a00be449d0aa413252161db7b5b1bafec3012b9
- Architectural Design Process: vitruvius-connection/001_Raw-Source-Layer/002-History/Design Process.pdf; Design Process refined markdown lines 8, 21, and 23; raw PDF pages 8, 21, and 23 checked by local PyMuPDF extraction; raw=sha256:867f07de2d857d74d256a137571150773d5e14296d2e26ea013cd3a720816e35; refined=sha256:c2d312913532efffce902e059c49ea731ac09245fd7da29fbbd30fec52afcb80

### lea-plan-005-01-what-you-need-to-know-for-the-lea

- Building Construction Illustrated, 5th Edition: vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf; BCI refined markdown lines 245-288, 333-370, 407-455, 483-508, and 1328-1340; raw PDF pages 11-12, 17-18, and 20-21 checked by local PyMuPDF extraction; raw=sha256:528acdc8afd84d937d5ab49a5df8c349321d20d3d403d110e038628e4d2f1c02; refined=sha256:0f3213a3ca3dcf8fd2076dae5e1b12a215dc7041950f864cfd5f4b53250c820a
- Open Space Development Guidelines: vitruvius-connection/001_Raw-Source-Layer/001-Laws/HLURB-DHSUD/Open Space Development Guidelines.pdf; Open Space Guidelines refined markdown lines 36-60, 549-573, 581-665, 1705-1724, and 1729-1759; raw PDF pages 1, 3-5, and 9 checked by local PyMuPDF extraction; raw=sha256:2ca6d61605d370035cdd8679a43cdd57d5f40deada47601ea56e5161733e0add; refined=sha256:2be9fa0f23c22913f06acedf5905c5ebf004240ee764b47a2b1c97e15b9d9b2b
- Revised IRR of BP 220, 2008: vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf; BP 220 refined markdown lines 105-147, 151-195, 215-264, 420-465, and 482-504; raw PDF pages 5-6, 8-10, and 12 checked by local PyMuPDF extraction; raw=sha256:7392741260c227647afe39de283f3efa979465692da8905e59be8857c8651614; refined=sha256:4d66a5ce3891d6405324d52ae8b874f75321da0e5f00213489be43d754d27be1
- PD 957 IRR - Subdivision and Condominium Buyers Protective Decree: vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-957/PD 957 IRR - Subdivision and Condominium IRR.pdf; PD 957 refined markdown lines 105-123, 129-177, 198-224, 358-405, and 470-512; raw PDF pages 6-7 and 11-14 checked by local PyMuPDF extraction; raw=sha256:1f9ab17a816885cfdbafafc03e3e9b64470a737447129a32a459836d6773f9ea; refined=sha256:0edd45f5293044779c45c36e5219904d3863cfa747d200864959fc1bf6a9ff7b
- DOE Guidelines on Energy Conserving Design of Buildings, 2008: vitruvius-connection/001_Raw-Source-Layer/001-Laws/DOE/DOE Guidelines on Energy Conserving Design on Buildings v2008.pdf; DOE Guidelines refined markdown lines 717-795, 1429-1450, and 1533-1537; raw PDF pages 33, 35-36, 39-40, and 42 checked by local PyMuPDF extraction; raw=sha256:9a1a4019b500ffc2873625db6f04ac50b39aea7cadac9159464f9ed716e8126c; refined=sha256:477f0990a67359eee303e8280a00be449d0aa413252161db7b5b1bafec3012b9
- Sitework Lecture: vitruvius-connection/001_Raw-Source-Layer/004-Technology/Sitework Lecture.pdf; Sitework Lecture refined markdown lines 1-90 and 560-609; raw PDF pages 1-6 and paving/surfacing pages checked by local PyMuPDF extraction; raw=sha256:a469e97d2c4b842f443864c658fc4359ef2787a2b009b9fbafc1afbd1da25ff6; refined=sha256:e761c9b38b9d0c07bd6053692337109a218169ba791e8f074fa40842d3972af2

## Artifact Paths

- Ledger: .ai/content-audit-export/source-audited-article-batch-074-local-first-ledger.json
- Scoped checks: .ai/content-audit-export/source-audited-article-batch-074-local-first-scoped-checks.json
- Handoff: .ai/03_plans/source-audited-local-first-batches-handoff.md

## Blockers

- None.
