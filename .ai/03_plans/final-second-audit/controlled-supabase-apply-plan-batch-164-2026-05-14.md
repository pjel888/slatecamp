# Controlled Supabase Apply Plan — Batch 164 Question Remediation

Generated: 2026-05-14

## Status

Final freeze audit verdict: `PASS_WITH_NOTED_SCOPE_ANOMALY`.

Accepted HEAD at plan creation: `8d1be3503`.

Remote branch: `origin/3dlab-gray-viewport-bg`.

## Scope

Apply scope is **Batch 164 question-alignment remediation only**.

- Article body updates: 0
- Question updates: 90
- Answer-key changes: 0
- Source family: local NSCP 2015 OCR anchors
- Batch 167 artifacts: zero-content closure only; no apply action

## Explicit Restrictions

Do not run any of the following as part of this apply plan:

- production deploy
- merge to `main`
- force-push
- broad Supabase article push (`--all-safe`)
- article candidate apply, unless a later audit identifies a specific article body repair
- staging unrelated dirty files

## Pre-Apply Dry Run

Run from repo root:

```bash
set -euo pipefail
bun run test:source-verification
python3 - <<'PY'
from pathlib import Path
import json
root=Path('.ai/content-audit-export')
for p in [
  root/'source-audited-article-batch-164-local-first-ledger.json',
  root/'source-audited-article-batch-164-local-first-scoped-checks.json',
]:
    json.loads(p.read_text())
print('Batch 164 JSON parse: PASS')
PY
```

Then dry-run each question update:

```bash
set -euo pipefail
while read -r qid; do
  [ -z "$qid" ] && continue
  bun run content-audit:push-question:dry-run -- --question-id "$qid" --strict
done <<'QIDS'
00f76274-9125-4e6c-8eae-473634d9511b
0219dc35-4e33-4ce0-b077-c008de043af6
02b11a14-0f2e-41ee-82cf-2d83c09af0e2
02cea262-5a75-4808-86e3-051379a503c3
05cd5a06-3183-4848-9b1f-f8cb6a36f581
0863616e-8994-4ed6-91c7-e3b5684ed4a5
09117f07-7332-47ae-94e9-75f9effee9f2
09f7ddea-f3f3-430e-99b0-42814f68e442
0c2afd87-7afa-49e6-8974-3a2d224f1af2
0d2b06f3-b6a3-4168-9e53-0f1eba1a28d9
0d8debcf-c39f-428d-a756-cde40a1b307a
0ec1aafb-068f-4811-914d-f028558b6227
136a9f76-4115-4c68-ac4a-aa015e09f5aa
16abc24a-8747-48b9-96f6-93da3d0b017b
18988e39-3d86-4bf3-8c1a-a3647ecc8366
1c85cd70-7225-435d-ba16-00c211e62b29
1dba5961-c1da-413b-82fe-fab5c4fc41fe
1f1f7b09-f4f6-4de1-83b4-65859acf050d
21b3a069-8ad6-402b-9423-608071bdf1e6
27e3b467-5bed-4061-95f6-c8d7a8a85863
2b17803b-3aa6-4188-bbe2-8d88091f712e
31f01fa7-d997-4a9f-aff6-5762d82be418
34def5c9-1623-4322-bd32-47636959a406
37b399b3-f04c-4d24-a3bd-7fe1fd2bc186
3f4dce01-3e79-4f74-9005-118a14543cfe
425007a6-69a2-4550-b17a-0e6e188d3bd6
44451fd7-4e96-4176-a756-f13c6a87b1f8
4864b616-2862-4dad-be1f-8b73baa8e983
488b3c49-4af9-4d33-a76e-af7501a57702
56606db8-efb9-411c-b64a-49124c5a3756
5c74d1f9-f1fb-48ab-95f2-6be2ee361d52
60a71679-a95f-4b65-8ddd-36e05a2c0ed1
6500b2df-2855-4858-8d76-465959e042c7
662044b0-dc1e-437b-90c3-a62e6366324a
68e4364f-84b2-4396-8a29-541ff0147809
6c765e0f-401b-4fa7-a331-0d6952b16166
7ac3ba8b-5381-4299-ab78-4161de86e9b4
7e3698a4-7da8-43e3-ad9d-1d9ef857020c
7f1e7259-26ba-4411-b27c-46d5a4b319eb
7f446ec1-b5d6-4c76-ad7e-7bb8a6cff5a7
7f510800-98bb-49e7-a123-9d71257fca12
853c8d7f-7eb2-4c74-bf58-7b0f81ab978e
89d46074-1673-472b-a0d9-b6b7eb2d41ca
94abda41-a060-4bbe-943a-2d981037bf9e
961a0025-7d66-4687-a931-e9a1ac59e619
9640e7ab-7532-4a85-b54e-683ffb2b9466
96d4546c-eab8-4ac1-ac61-7ccfc81a797f
99438c76-e9fc-4436-8ecf-208de1f1d5e1
994be8d3-da40-4bef-adde-fa327cfe6cd1
995484a4-d309-4bcf-85d9-73e0ecd04f1e
9be09de7-ea4e-4128-9fb3-0267bb7997e9
9c6a6587-1493-430c-9ae9-cad501989ed5
a41a4a87-5b33-474c-8365-1e60d2ee225b
a493ef1b-723a-4599-a71e-1fb1acad9228
a72c9aa8-a967-4b0f-8180-a9b3558261c6
a767d035-653c-4782-af2b-8d67e8796978
a7ddfea1-6c8b-4cba-967e-f0662ac042a9
aa3e5e12-6f4d-460e-b251-da273a19e59c
aabd6070-7a57-439b-b95e-64c35c9c83fa
ad388f32-8ec2-45d8-8a4f-1726da564759
b1599e60-b278-42b4-8f43-002a5f7df349
b38842a0-af75-4746-88ed-282a67f96db1
b3958f33-180d-4bf5-b1fb-dc1c6c02857e
b495ee57-be6f-4e97-a4bf-39ee822e7aa0
b683dad1-83ca-4973-a6d2-dd80480182af
c13d8387-d38a-47f1-99c3-42ca182f2081
c1ed334c-bcb3-4322-b56a-a6add8b96b84
c503eb0a-79f5-4041-baa6-6ee79e9d1b7c
c5a6da5f-9d82-4137-a1ed-73a67cbc48b4
c7b1786e-3a56-45f4-b7c9-a2eae78515a4
d37a4ca3-16c9-415f-bfaf-4e22292d6998
d4d01df7-df76-464c-9424-b1d99104d2a5
d7192cdc-b9bb-4e30-b920-43d70262b701
d80bfbfb-532b-4cbe-83dd-742dd4e66ac3
da6f9fdd-e385-467b-98d6-0d56fe57159a
dc6455d2-06ab-438d-835d-01d050258c3f
e080685f-fe5e-42bf-86e1-5cbaa5663de9
e4a4c9d2-4019-4e22-8390-d377bf415d73
e5179a2a-67ba-4c10-8218-82d980349bfb
e89766e7-b8ff-4981-8d2c-e2a2cf599820
e9538c8d-119a-4361-ac95-53d7a8747bc9
eef31c78-687c-49cf-9d55-912d2a33df7a
efc0ee7f-1f80-43b8-8e7d-ff3fe67d619b
efe5debd-0e8a-49cf-b666-715236dfccc0
f03689fe-68c2-40c5-87f3-33d5b4a1397b
f24e257f-ca78-467f-8719-2d28fe0d3722
f7809040-5f36-445c-84b7-9a1dfa8bd4c8
f88b1cee-f81c-4809-b056-b2ab90d425e9
f8fd0b57-119f-4584-a713-7cd5e2e340d2
ff3dd962-75e0-4e37-a01e-58001e23d407
QIDS
```

Dry-run acceptance gate:

- every dry-run exits 0
- no stale baseline blockers
- no missing remote questions
- no missing question-edit files
- generated `*.push-report.json` files show `dry_run: true`, `pushed: false`, `blockers: []`

## Apply Command

Only after dry-run passes and Philip explicitly approves Supabase mutation:

```bash
set -euo pipefail
while read -r qid; do
  [ -z "$qid" ] && continue
  bun run content-audit:push-question:apply -- --question-id "$qid" --strict
done <<'QIDS'
00f76274-9125-4e6c-8eae-473634d9511b
0219dc35-4e33-4ce0-b077-c008de043af6
02b11a14-0f2e-41ee-82cf-2d83c09af0e2
02cea262-5a75-4808-86e3-051379a503c3
05cd5a06-3183-4848-9b1f-f8cb6a36f581
0863616e-8994-4ed6-91c7-e3b5684ed4a5
09117f07-7332-47ae-94e9-75f9effee9f2
09f7ddea-f3f3-430e-99b0-42814f68e442
0c2afd87-7afa-49e6-8974-3a2d224f1af2
0d2b06f3-b6a3-4168-9e53-0f1eba1a28d9
0d8debcf-c39f-428d-a756-cde40a1b307a
0ec1aafb-068f-4811-914d-f028558b6227
136a9f76-4115-4c68-ac4a-aa015e09f5aa
16abc24a-8747-48b9-96f6-93da3d0b017b
18988e39-3d86-4bf3-8c1a-a3647ecc8366
1c85cd70-7225-435d-ba16-00c211e62b29
1dba5961-c1da-413b-82fe-fab5c4fc41fe
1f1f7b09-f4f6-4de1-83b4-65859acf050d
21b3a069-8ad6-402b-9423-608071bdf1e6
27e3b467-5bed-4061-95f6-c8d7a8a85863
2b17803b-3aa6-4188-bbe2-8d88091f712e
31f01fa7-d997-4a9f-aff6-5762d82be418
34def5c9-1623-4322-bd32-47636959a406
37b399b3-f04c-4d24-a3bd-7fe1fd2bc186
3f4dce01-3e79-4f74-9005-118a14543cfe
425007a6-69a2-4550-b17a-0e6e188d3bd6
44451fd7-4e96-4176-a756-f13c6a87b1f8
4864b616-2862-4dad-be1f-8b73baa8e983
488b3c49-4af9-4d33-a76e-af7501a57702
56606db8-efb9-411c-b64a-49124c5a3756
5c74d1f9-f1fb-48ab-95f2-6be2ee361d52
60a71679-a95f-4b65-8ddd-36e05a2c0ed1
6500b2df-2855-4858-8d76-465959e042c7
662044b0-dc1e-437b-90c3-a62e6366324a
68e4364f-84b2-4396-8a29-541ff0147809
6c765e0f-401b-4fa7-a331-0d6952b16166
7ac3ba8b-5381-4299-ab78-4161de86e9b4
7e3698a4-7da8-43e3-ad9d-1d9ef857020c
7f1e7259-26ba-4411-b27c-46d5a4b319eb
7f446ec1-b5d6-4c76-ad7e-7bb8a6cff5a7
7f510800-98bb-49e7-a123-9d71257fca12
853c8d7f-7eb2-4c74-bf58-7b0f81ab978e
89d46074-1673-472b-a0d9-b6b7eb2d41ca
94abda41-a060-4bbe-943a-2d981037bf9e
961a0025-7d66-4687-a931-e9a1ac59e619
9640e7ab-7532-4a85-b54e-683ffb2b9466
96d4546c-eab8-4ac1-ac61-7ccfc81a797f
99438c76-e9fc-4436-8ecf-208de1f1d5e1
994be8d3-da40-4bef-adde-fa327cfe6cd1
995484a4-d309-4bcf-85d9-73e0ecd04f1e
9be09de7-ea4e-4128-9fb3-0267bb7997e9
9c6a6587-1493-430c-9ae9-cad501989ed5
a41a4a87-5b33-474c-8365-1e60d2ee225b
a493ef1b-723a-4599-a71e-1fb1acad9228
a72c9aa8-a967-4b0f-8180-a9b3558261c6
a767d035-653c-4782-af2b-8d67e8796978
a7ddfea1-6c8b-4cba-967e-f0662ac042a9
aa3e5e12-6f4d-460e-b251-da273a19e59c
aabd6070-7a57-439b-b95e-64c35c9c83fa
ad388f32-8ec2-45d8-8a4f-1726da564759
b1599e60-b278-42b4-8f43-002a5f7df349
b38842a0-af75-4746-88ed-282a67f96db1
b3958f33-180d-4bf5-b1fb-dc1c6c02857e
b495ee57-be6f-4e97-a4bf-39ee822e7aa0
b683dad1-83ca-4973-a6d2-dd80480182af
c13d8387-d38a-47f1-99c3-42ca182f2081
c1ed334c-bcb3-4322-b56a-a6add8b96b84
c503eb0a-79f5-4041-baa6-6ee79e9d1b7c
c5a6da5f-9d82-4137-a1ed-73a67cbc48b4
c7b1786e-3a56-45f4-b7c9-a2eae78515a4
d37a4ca3-16c9-415f-bfaf-4e22292d6998
d4d01df7-df76-464c-9424-b1d99104d2a5
d7192cdc-b9bb-4e30-b920-43d70262b701
d80bfbfb-532b-4cbe-83dd-742dd4e66ac3
da6f9fdd-e385-467b-98d6-0d56fe57159a
dc6455d2-06ab-438d-835d-01d050258c3f
e080685f-fe5e-42bf-86e1-5cbaa5663de9
e4a4c9d2-4019-4e22-8390-d377bf415d73
e5179a2a-67ba-4c10-8218-82d980349bfb
e89766e7-b8ff-4981-8d2c-e2a2cf599820
e9538c8d-119a-4361-ac95-53d7a8747bc9
eef31c78-687c-49cf-9d55-912d2a33df7a
efc0ee7f-1f80-43b8-8e7d-ff3fe67d619b
efe5debd-0e8a-49cf-b666-715236dfccc0
f03689fe-68c2-40c5-87f3-33d5b4a1397b
f24e257f-ca78-467f-8719-2d28fe0d3722
f7809040-5f36-445c-84b7-9a1dfa8bd4c8
f88b1cee-f81c-4809-b056-b2ab90d425e9
f8fd0b57-119f-4584-a713-7cd5e2e340d2
ff3dd962-75e0-4e37-a01e-58001e23d407
QIDS
```

Apply acceptance gate:

- every apply exits 0
- every per-question push report shows `pushed: true`
- `updated_rows_count: 1` for each question
- no answer-key fields changed from Batch 164 policy

## Post-Apply QA

After apply:

1. Re-export the 8 affected article bundles or targeted questions from Supabase.
2. Compare remote question text/options/rationales to Batch 164 `proposed` fields.
3. Spot-check at least two clusters in admin/developer content surfaces:
   - one structural cluster
   - one utility cluster
4. Confirm no article body candidate was pushed.
5. Commit only generated push reports if we decide to preserve apply evidence.

## Question IDs

- `00f76274-9125-4e6c-8eae-473634d9511b`
- `0219dc35-4e33-4ce0-b077-c008de043af6`
- `02b11a14-0f2e-41ee-82cf-2d83c09af0e2`
- `02cea262-5a75-4808-86e3-051379a503c3`
- `05cd5a06-3183-4848-9b1f-f8cb6a36f581`
- `0863616e-8994-4ed6-91c7-e3b5684ed4a5`
- `09117f07-7332-47ae-94e9-75f9effee9f2`
- `09f7ddea-f3f3-430e-99b0-42814f68e442`
- `0c2afd87-7afa-49e6-8974-3a2d224f1af2`
- `0d2b06f3-b6a3-4168-9e53-0f1eba1a28d9`
- `0d8debcf-c39f-428d-a756-cde40a1b307a`
- `0ec1aafb-068f-4811-914d-f028558b6227`
- `136a9f76-4115-4c68-ac4a-aa015e09f5aa`
- `16abc24a-8747-48b9-96f6-93da3d0b017b`
- `18988e39-3d86-4bf3-8c1a-a3647ecc8366`
- `1c85cd70-7225-435d-ba16-00c211e62b29`
- `1dba5961-c1da-413b-82fe-fab5c4fc41fe`
- `1f1f7b09-f4f6-4de1-83b4-65859acf050d`
- `21b3a069-8ad6-402b-9423-608071bdf1e6`
- `27e3b467-5bed-4061-95f6-c8d7a8a85863`
- `2b17803b-3aa6-4188-bbe2-8d88091f712e`
- `31f01fa7-d997-4a9f-aff6-5762d82be418`
- `34def5c9-1623-4322-bd32-47636959a406`
- `37b399b3-f04c-4d24-a3bd-7fe1fd2bc186`
- `3f4dce01-3e79-4f74-9005-118a14543cfe`
- `425007a6-69a2-4550-b17a-0e6e188d3bd6`
- `44451fd7-4e96-4176-a756-f13c6a87b1f8`
- `4864b616-2862-4dad-be1f-8b73baa8e983`
- `488b3c49-4af9-4d33-a76e-af7501a57702`
- `56606db8-efb9-411c-b64a-49124c5a3756`
- `5c74d1f9-f1fb-48ab-95f2-6be2ee361d52`
- `60a71679-a95f-4b65-8ddd-36e05a2c0ed1`
- `6500b2df-2855-4858-8d76-465959e042c7`
- `662044b0-dc1e-437b-90c3-a62e6366324a`
- `68e4364f-84b2-4396-8a29-541ff0147809`
- `6c765e0f-401b-4fa7-a331-0d6952b16166`
- `7ac3ba8b-5381-4299-ab78-4161de86e9b4`
- `7e3698a4-7da8-43e3-ad9d-1d9ef857020c`
- `7f1e7259-26ba-4411-b27c-46d5a4b319eb`
- `7f446ec1-b5d6-4c76-ad7e-7bb8a6cff5a7`
- `7f510800-98bb-49e7-a123-9d71257fca12`
- `853c8d7f-7eb2-4c74-bf58-7b0f81ab978e`
- `89d46074-1673-472b-a0d9-b6b7eb2d41ca`
- `94abda41-a060-4bbe-943a-2d981037bf9e`
- `961a0025-7d66-4687-a931-e9a1ac59e619`
- `9640e7ab-7532-4a85-b54e-683ffb2b9466`
- `96d4546c-eab8-4ac1-ac61-7ccfc81a797f`
- `99438c76-e9fc-4436-8ecf-208de1f1d5e1`
- `994be8d3-da40-4bef-adde-fa327cfe6cd1`
- `995484a4-d309-4bcf-85d9-73e0ecd04f1e`
- `9be09de7-ea4e-4128-9fb3-0267bb7997e9`
- `9c6a6587-1493-430c-9ae9-cad501989ed5`
- `a41a4a87-5b33-474c-8365-1e60d2ee225b`
- `a493ef1b-723a-4599-a71e-1fb1acad9228`
- `a72c9aa8-a967-4b0f-8180-a9b3558261c6`
- `a767d035-653c-4782-af2b-8d67e8796978`
- `a7ddfea1-6c8b-4cba-967e-f0662ac042a9`
- `aa3e5e12-6f4d-460e-b251-da273a19e59c`
- `aabd6070-7a57-439b-b95e-64c35c9c83fa`
- `ad388f32-8ec2-45d8-8a4f-1726da564759`
- `b1599e60-b278-42b4-8f43-002a5f7df349`
- `b38842a0-af75-4746-88ed-282a67f96db1`
- `b3958f33-180d-4bf5-b1fb-dc1c6c02857e`
- `b495ee57-be6f-4e97-a4bf-39ee822e7aa0`
- `b683dad1-83ca-4973-a6d2-dd80480182af`
- `c13d8387-d38a-47f1-99c3-42ca182f2081`
- `c1ed334c-bcb3-4322-b56a-a6add8b96b84`
- `c503eb0a-79f5-4041-baa6-6ee79e9d1b7c`
- `c5a6da5f-9d82-4137-a1ed-73a67cbc48b4`
- `c7b1786e-3a56-45f4-b7c9-a2eae78515a4`
- `d37a4ca3-16c9-415f-bfaf-4e22292d6998`
- `d4d01df7-df76-464c-9424-b1d99104d2a5`
- `d7192cdc-b9bb-4e30-b920-43d70262b701`
- `d80bfbfb-532b-4cbe-83dd-742dd4e66ac3`
- `da6f9fdd-e385-467b-98d6-0d56fe57159a`
- `dc6455d2-06ab-438d-835d-01d050258c3f`
- `e080685f-fe5e-42bf-86e1-5cbaa5663de9`
- `e4a4c9d2-4019-4e22-8390-d377bf415d73`
- `e5179a2a-67ba-4c10-8218-82d980349bfb`
- `e89766e7-b8ff-4981-8d2c-e2a2cf599820`
- `e9538c8d-119a-4361-ac95-53d7a8747bc9`
- `eef31c78-687c-49cf-9d55-912d2a33df7a`
- `efc0ee7f-1f80-43b8-8e7d-ff3fe67d619b`
- `efe5debd-0e8a-49cf-b666-715236dfccc0`
- `f03689fe-68c2-40c5-87f3-33d5b4a1397b`
- `f24e257f-ca78-467f-8719-2d28fe0d3722`
- `f7809040-5f36-445c-84b7-9a1dfa8bd4c8`
- `f88b1cee-f81c-4809-b056-b2ab90d425e9`
- `f8fd0b57-119f-4584-a713-7cd5e2e340d2`
- `ff3dd962-75e0-4e37-a01e-58001e23d407`
