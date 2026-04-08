#!/usr/bin/env bun
/**
 * rollback-title-fix.ts
 *
 * EMERGENCY ROLLBACK — restores the 80 titles incorrectly overwritten with
 * "What You Need to Know for the LEA" by fix-anomalous-titles.ts (bad run).
 * Also restores the 1 title set to "The Real-World Scenario (The Hook)".
 *
 * Run with: bun run scripts/rollback-title-fix.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Complete mapping: article_id → correct original title
const ROLLBACK: Record<string, string> = {
  '20ac90a7-f0e9-49cf-9459-86353d538af9': 'Fire stations',
  '757e71dc-bf5f-4a3a-9948-5063d8cd67bb': 'Greek Architecture',
  'a73a7409-4f9b-4d7d-afd0-d49bc7ebca6b': 'Roman Architecture',
  '39f480ed-755f-499a-935f-d339e6bb3c87': 'Mughal architecture',
  '2e4a909c-e9e6-4d2a-9d9d-57a8e48a6bce': 'Inca Architecture',
  'c93bfab9-3571-4e80-8d9b-d9d50a9eff02': 'Neoclassicism',
  'cd18af9a-b1e1-42d4-a254-ff5244838f19': 'Funeral Homes',
  '7095ced9-9182-4eda-917b-84568cd74ba2': 'Korean Architecture',
  '642d4061-fc9e-4027-9f3b-308331151792': 'Passive design',
  '6a928e7c-ea49-43ae-9241-e3cacfe291cf': 'Fire egress',
  '21880755-59f3-4749-9786-59e6cb53c6ed': 'Site analysis',
  '6c4f539a-c589-4f53-bbfe-d4396641a3e6': 'Floor Plans',
  'bf583e70-ccc8-4e6e-8b6a-1794533a4d7f': 'Elevations',
  'a25678f1-1d48-4938-8224-789315df40de': 'Site Plans',
  '3067e127-60c0-4570-ab86-d85af25fb9b2': 'Design brief',
  '81a065b0-77f6-4f96-98cd-a3239c6beae4': 'Stair Design',
  '17acdb19-55dc-4136-862d-62825aa8fb4b': 'Circulation',
  'f30fd9ee-3ab3-46d0-a5bb-dba7e88ac4d1': 'Indoor air quality',
  'c0e15f56-dc57-4814-b6fb-7ee7f554a209': 'Le Corbusier',
  'faa3088f-8700-4d60-a871-1c1e97f53570': 'Walter Gropius',
  'd7e9ccad-d858-4bee-9786-d1fc9c3abefc': 'Alvar Aalto',
  '8769440f-0b98-49dd-b98b-a3b9be486892': 'The Bauhaus',
  'ed8d54e9-eef1-4585-9447-f9cff392bbff': 'Brutalism',
  '683abfcf-415c-4e89-9a9c-fcfd57aa1f2f': 'Deconstructivism',
  '22de8889-365b-4034-af03-36636d3c101c': 'Parametricism',
  'af09c106-1da0-46e4-8081-bd3b5e393428': 'Frank Lloyd Wright',
  '18c848be-4850-489e-882d-b29537a69f06': 'Wood Connections',
  '7dccfed0-8f85-47ad-b72b-8e5940d8276a': 'Non-Ferrous Metals',
  'f34aade8-a870-458c-9609-562419eb1238': 'Fastener Systems',
  'f06686b1-8dc4-4514-9e32-5e4cd0365006': 'Window operations',
  'e94f5a24-e9fa-48f6-aa3e-f1de31922f46': 'Adhesive Systems',
  'd0466bdc-3061-46b5-9400-2c41d7eb7c97': 'CHB quantity',
  'b68471a2-34f6-46e3-8f79-7a14ed16eebb': 'Rebar weight',
  '40dc0d6d-ae04-49de-b43a-36e9288a0622': 'Paint coverage',
  'f876a304-f787-4c8b-ab2c-a1a71dfe6257': 'Tile quantity',
  '0b83bfa7-6ca2-48f8-9f23-52428c85d02a': 'Earthwork volume',
  '39796d5a-c2fd-467f-8891-9e7b32091617': 'Concrete volume',
  '0ed94cf5-6a2b-4062-8e8b-4f514ca89be5': 'CSI MasterFormat',
  'd28bf43f-a588-4be3-8b79-8759d930aea4': 'Urban planning',
  '0d2e80df-4f76-484e-9b1f-5502da9e35be': 'Philippine',
  '7c0e2fa5-7f3d-419a-b592-50346ac7ab2f': 'Philippine',
  'ac9af0bb-dcf3-4a02-b409-d19bca68e514': 'Human settlement',
  '08dff936-85fa-4f57-8388-466ecca109e4': 'Informal settlement',
  '8a8a6153-844c-4671-aae6-b42b5a9435dd': 'Philippine',
  '72e04c5e-3e4c-4715-93a0-734bdf6dcbee': 'Door hardware',
  'f5374d6a-fc70-475e-83ce-7feb64056655': 'Landscape design',
  '236408d0-58f8-4761-8b02-7201ec857e97': 'Stormwater',
  'f769b43e-e467-4ce4-afd9-2d0152fe8d46': "Architect's Credo",
  '622a401a-b889-4744-9d44-f77daa1627b4': 'Multi-purpose halls',
  '5de12a80-903b-4488-bc66-e855e8cb4129': 'Site grading',
  'f5c0e7a8-8017-4c9b-a1d1-8938a338471f': 'Daylighting',
  '3e530aa4-6004-4664-a241-9634a725bd5c': 'SPP Doc 208',
  '916cb394-9854-4d8e-ae0a-fd1747e37b3f': 'Paint systems',
  'd6fa3f26-bf8e-4b5d-9313-fcad16af0d86': 'Construction claims',
  'd713a3b5-968e-4950-9f37-dd34d116b042': 'Static Determinacy',
  '5346c118-e05d-4588-8454-96ffd7556ef4': 'Precast Concrete',
  'f4438093-a209-4c53-9f43-6ad4d9be677e': 'Concrete cover',
  '7680a85a-b8ee-4b09-a782-00d77fa5c007': 'Bearing wall',
  '1650d23e-b703-48f4-87a3-839f9209e7a0': 'Base shear (V)',
  '019533d8-f19f-456e-a2e0-74e889a3b32e': 'Accelerograph',
  '205905a8-f9ff-41e7-8db7-a85edd563a84': 'Live load (LL)',
  '3f7f47a9-1620-4a50-9adb-d0cfc32fbf3d': 'Foundation',
  'f53f5341-65fa-4a84-849b-a188f12d3106': 'Prestressing',
  '2a25a20f-fe57-48c9-abad-7c8b2f0d1dd6': 'Anthropometrics',
  '1aaa804a-23f1-44da-bdcb-412fa04c848d': 'Architecture',
  'c2603440-ad82-425f-8c7d-38b71c10a1ef': 'Adaptive reuse',
  'bcb4ca34-92b0-4fd6-8b0d-b8f45c44bb5f': 'Functional zoning',
  'c158e63c-6120-4b2f-9784-c853ef25baa5': 'Bubble diagrams',
  'c4eb5745-a35a-4c85-94d2-e7d687a40278': 'Finish schedule',
  '973b8e3d-c930-437d-b01d-eb33f4a047d8': 'Philippine',
  '0eb7f711-b740-42d6-9c25-ee45b0242eb4': 'Restaurants',
  '630d0fd8-e25f-4bf8-a62f-f31b4e320831': 'Gothic Architecture',
  '5e99dd5d-1394-46bc-998e-8915e2595b0b': 'Punch list',
  '76bf05bd-fdc9-477b-b2cb-e2b749faf1b2': 'Shear wall',
  'abc56d0a-101e-4bef-9eda-e5412892652e': 'Masonry unit',
  'cb07f9cb-7506-496e-941a-4080a05c323f': 'Biophilic Design',
  '6bfa7e66-ac5c-4a52-8f92-0ca94b945305': 'Natural Ventilation',
  '2e117d95-eb4c-4d96-8e3f-b31f18d26a64': 'Thermal Comfort',
  'c39cc1e8-90fb-4c47-95f2-6bb4b370c6d7': 'Brutalism',          // was wrongly set to "The Real-World Scenario (The Hook)"
  '490d7fe6-8f50-404e-a323-1d9a99139869': 'Mechanical rooms',
}

async function main() {
  console.log('═════════════════════════════════════════════════════════')
  console.log('EMERGENCY ROLLBACK — Restoring original titles')
  console.log(`Total records to restore: ${Object.keys(ROLLBACK).length}`)
  console.log('═════════════════════════════════════════════════════════\n')

  let successCount = 0
  let failCount = 0

  for (const [article_id, title] of Object.entries(ROLLBACK)) {
    const { error } = await supabase
      .from('wiki_articles')
      .update({ title })
      .eq('article_id', article_id)

    if (error) {
      console.error(`  [FAIL] [${article_id}] → "${title}": ${error.message}`)
      failCount++
    } else {
      console.log(`  [OK]   [${article_id}] → "${title}"`)
      successCount++
    }
  }

  console.log('\n═════════════════════════════════════════════════════════')
  console.log('ROLLBACK REPORT')
  console.log(`  Restored : ${successCount}`)
  console.log(`  Failed   : ${failCount}`)
  console.log('═════════════════════════════════════════════════════════')

  if (failCount > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
