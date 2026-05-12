# IMPL_18: Commercial & Marketing Visualizations

**Priority:** P2
**Effort:** ~1 week
**Purpose:** Dual-use visualizations that serve students AND function as marketing assets, pitch deck charts, institutional sales tools, and data licensing products.

---

## Design Principle

Every visualization below must be renderable in two modes:
1. **In-app:** Interactive, personalized, within the Analytics Dashboard or CEO Dashboard
2. **Exportable:** Static PNG/SVG with SlateCamp branding for pitch decks, landing pages, and sales materials

Use a shared `<ExportableChart>` wrapper that adds branding and export functionality:

```typescript
// src/components/analytics/ExportableChart.tsx
interface ExportableChartProps {
  title: string;
  children: React.ReactNode;
  showBranding?: boolean; // Adds SlateCamp logo + timestamp
}

// Export methods: PNG download, SVG download, copy to clipboard
```

---

## 1. Readiness Score Trajectory (Cohort Aggregate)

**Location:** CEO Dashboard + Landing Page + Pitch Deck

Average Readiness Score growth over 12 weeks across all users. The hero chart.

```sql
-- Aggregate trajectory: average RS per week across all active users
SELECT
  DATE_TRUNC('week', created_at) AS week,
  AVG(overall_score) AS avg_readiness,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY overall_score) AS p25,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY overall_score) AS p75,
  COUNT(DISTINCT user_id) AS user_count
FROM readiness_score_snapshots
WHERE created_at > NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week;
```

**Chart:** Line chart with confidence bands (p25–p75 shaded area). Camp Cobalt primary line. Marketing headline: "Average +25 points in 12 weeks."

---

## 2. Pass Rate Correlation Chart

**Location:** CEO Dashboard + Landing Page (when data available)

Scatter plot: Readiness Score at exam day (x-axis) vs. actual ALE outcome (y-axis or pass/fail binary).

```sql
SELECT
  readiness_score_at_exam,
  passed,
  overall_score
FROM exam_outcomes
WHERE verified = true;
```

**Chart:** Scatter with logistic regression curve overlay. Vertical line at the "safe zone" threshold. Marketing headline: "Students with RS ≥ 80 had a X% pass rate."

**Gate:** Only render when `exam_outcomes` has ≥ 50 verified records. Before that, show placeholder: "Data collection in progress."

---

## 3. Institutional Taxonomy Heatmap

**Location:** CEO Dashboard + Institutional sales presentations

Aggregate heatmap of an entire graduating batch, showing where the school's students are weak.

```sql
-- Per-school aggregate mastery by taxonomy node
SELECT
  tt.name AS topic_name,
  tt.id AS topic_id,
  AVG(unm.current_mastery_weight) AS avg_mastery,
  COUNT(DISTINCT unm.user_id) AS student_count,
  SUM(CASE WHEN unm.current_mastery_weight < 0.5 THEN 1 ELSE 0 END) AS red_count
FROM user_node_mastery unm
JOIN profiles p ON p.id = unm.user_id
JOIN taxonomy_tree tt ON tt.id = unm.topic_id
WHERE p.school_id = $1  -- Filter by institution
GROUP BY tt.id, tt.name
ORDER BY avg_mastery ASC;
```

**Visual:** Same heatmap component as student view, but with aggregate data. Red zones = "70% of your batch is bleeding red in Structural Design." This visualization closes institutional deals.

---

## 4. Node Reclassification Rate

**Location:** CEO Dashboard + Landing Page

"X% of users moved from Red to Green in 30 days."

```sql
-- Count nodes that moved from mastery < 0.5 to mastery >= 0.7 in 30 days
WITH before AS (
  SELECT user_id, topic_id, overall_score AS score_before
  FROM readiness_score_snapshots
  WHERE created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
),
after AS (
  SELECT user_id, topic_id, overall_score AS score_after
  FROM readiness_score_snapshots
  WHERE created_at > NOW() - INTERVAL '7 days'
)
-- ... join and calculate reclassification counts
```

**Chart:** Single large metric + bar chart showing reclassification by subject area. Marketing: "Proof that SlateCamp teaches, not just tests."

---

## 5. Before/After Readiness Distribution

**Location:** Landing page, ads

Histogram overlay: Readiness Score distribution at signup vs. after 8 weeks.

```sql
-- Distribution at week 0
SELECT
  WIDTH_BUCKET(overall_score, 0, 100, 20) AS bucket,
  COUNT(*) AS count
FROM readiness_score_snapshots rss
JOIN (
  SELECT user_id, MIN(created_at) AS first_snapshot
  FROM readiness_score_snapshots
  GROUP BY user_id
) first ON rss.user_id = first.user_id AND rss.created_at = first.first_snapshot
GROUP BY bucket;

-- Distribution at week 8 (similar, using snapshot closest to 8 weeks after first)
```

**Chart:** Two overlaid histograms. Before = light gray. After = Camp Cobalt. The rightward shift IS the product. Marketing: "This is what 8 weeks of SlateCamp looks like."

---

## 6. Stamina Ceiling Growth

**Location:** CEO Dashboard + Landing Page

Average items-before-fatigue over time.

```sql
-- Define fatigue point: question position where rolling 10-question accuracy drops below 60%
-- Track this per user over time, then aggregate
```

**Chart:** Line chart showing average stamina ceiling across cohort, trending upward. Marketing: "Our users sustain focus for 30 more questions than when they started."

---

## 7. Calibration Improvement Arc

**Location:** CEO Dashboard + Landing Page

Aggregate calibration accuracy improvement over time.

```sql
SELECT
  DATE_TRUNC('week', created_at) AS week,
  AVG(calibration_score) AS avg_calibration,
  AVG(overconfidence_index) AS avg_overconfidence
FROM calibration_snapshots
GROUP BY week
ORDER BY week;
```

**Chart:** Dual-axis — calibration score (ascending line) + overconfidence index (descending line). Marketing: "Students arrive overconfident by 25 points. After 6 weeks, their self-assessment accuracy improves by 60%."

---

## 8. Time-to-Mastery by Topic

**Location:** CEO Dashboard + Data licensing product

Average hours/sessions to move a node from Red to Green, by topic.

```sql
SELECT
  tt.name,
  AVG(EXTRACT(EPOCH FROM (green_at - first_attempt_at)) / 3600) AS avg_hours_to_mastery,
  COUNT(DISTINCT user_id) AS sample_size
FROM (
  -- Subquery: find first attempt and first green timestamp per user-topic
  SELECT user_id, topic_id,
    MIN(created_at) AS first_attempt_at,
    MIN(CASE WHEN current_mastery_weight >= 0.7 THEN updated_at END) AS green_at
  FROM user_node_mastery
  GROUP BY user_id, topic_id
  HAVING MIN(CASE WHEN current_mastery_weight >= 0.7 THEN updated_at END) IS NOT NULL
) mastery_events
JOIN taxonomy_tree tt ON tt.id = mastery_events.topic_id
GROUP BY tt.name
HAVING COUNT(DISTINCT user_id) >= 20
ORDER BY avg_hours_to_mastery DESC;
```

**Chart:** Horizontal bar chart, sorted by hours. Sell this data to universities: "Structural Design takes 14 hours to master. Professional Practice takes 6." This is the beginning of the data licensing revenue stream.

---

## 9. Study Pattern → Outcome Correlation

**Location:** CEO Dashboard + Content marketing

Which behaviors correlate with higher Readiness Scores?

```sql
SELECT
  CASE
    WHEN weekly_sessions >= 5 AND avg_session_minutes BETWEEN 20 AND 40 THEN 'Frequent short sessions'
    WHEN weekly_sessions <= 2 AND avg_session_minutes > 90 THEN 'Infrequent long sessions'
    WHEN weekly_sessions >= 3 AND avg_session_minutes BETWEEN 40 AND 70 THEN 'Moderate balanced'
    ELSE 'Other'
  END AS study_pattern,
  AVG(latest_readiness_score) AS avg_readiness,
  COUNT(*) AS user_count
FROM user_study_patterns  -- Materialized view
GROUP BY study_pattern;
```

**Chart:** Grouped bar chart showing average Readiness Score by study pattern. Marketing: "Students who study 4×/week for 30 min outperform those who study 2×/week for 2 hours."

---

## 10. Geographic Performance Map

**Location:** CEO Dashboard + Institutional marketing

Philippine map with average Readiness Scores by region or school.

```sql
SELECT
  p.school_name,
  p.region,
  AVG(ugs.readiness_score) AS avg_readiness,
  COUNT(*) AS student_count
FROM profiles p
JOIN user_global_stats ugs ON ugs.user_id = p.id
WHERE p.school_name IS NOT NULL
GROUP BY p.school_name, p.region
HAVING COUNT(*) >= 10;
```

**Chart:** Choropleth map of Philippine regions (use TopoJSON). Color intensity = average Readiness Score. School markers overlaid. Institutional buyers want to benchmark.

**Note:** Requires `region` and `school_name` fields on `profiles`. Add during onboarding.

```sql
ALTER TABLE profiles ADD COLUMN school_name TEXT;
ALTER TABLE profiles ADD COLUMN region TEXT;
```

---

## Export Pipeline

All charts above share the `<ExportableChart>` wrapper. Export options:
- **PNG:** Canvas-based screenshot at 2× resolution for retina
- **SVG:** Vector export for pitch decks (editable in Figma/Keynote)
- **Data CSV:** Raw data export for custom analysis (CEO Dashboard only)
- **Embeddable URL:** Public shareable link with read-only view (for landing page embedding)
