-- RPC: get_article_with_node
-- Replaces 2-4 sequential queries in resolveArticleAndNode (wiki-actions.ts:345-434)
-- Handles both resolution paths in a single round-trip:
--   Path 1: slug matches wiki_articles.slug → resolve node via junction
--   Path 2: slug matches taxonomy_tree.slug → resolve article via junction
CREATE OR REPLACE FUNCTION get_article_with_node(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_article jsonb;
  v_node jsonb;
  v_article_id uuid;
  v_node_id uuid;
BEGIN
  -- Path 1: Try matching slug against wiki_articles
  SELECT jsonb_build_object(
    'article_id', wa.article_id,
    'slug', wa.slug,
    'title', wa.title,
    'content', wa.content,
    'created_at', wa.created_at,
    'updated_at', wa.updated_at,
    'lea_tests_you', wa.lea_tests_you,
    'updated_note', wa.updated_note,
    'subject_label', wa.subject_label,
    'difficulty_label', wa.difficulty_label,
    'status', wa.status
  ), wa.article_id
  INTO v_article, v_article_id
  FROM wiki_articles wa
  WHERE wa.slug = p_slug AND wa.status = 'published'
  LIMIT 1;

  IF v_article IS NOT NULL THEN
    -- Article found — resolve node via junction (prefer is_primary)
    SELECT wat.node_id INTO v_node_id
    FROM wiki_article_taxonomy wat
    WHERE wat.article_id = v_article_id AND wat.is_primary = true
    LIMIT 1;

    IF v_node_id IS NULL THEN
      SELECT wat.node_id INTO v_node_id
      FROM wiki_article_taxonomy wat
      WHERE wat.article_id = v_article_id
      LIMIT 1;
    END IF;

    IF v_node_id IS NOT NULL THEN
      SELECT jsonb_build_object(
        'node_id', tt.node_id,
        'discipline_id', tt.discipline_id,
        'parent_id', tt.parent_id,
        'level', tt.level,
        'name', tt.name,
        'subject_area', tt.subject_area,
        'is_leaf', tt.is_leaf,
        'slug', tt.slug,
        'sort_order', tt.sort_order,
        'lea_id', tt.lea_id,
        'description', tt.description,
        'exam_frequency', tt.exam_frequency,
        'bloom_level', tt.bloom_level,
        'difficulty', tt.difficulty,
        'prc_area', tt.prc_area
      ) INTO v_node
      FROM taxonomy_tree tt
      WHERE tt.node_id = v_node_id;
    END IF;

    RETURN jsonb_build_object('article', v_article, 'node', v_node);
  END IF;

  -- Path 2: Try matching slug against taxonomy_tree
  SELECT jsonb_build_object(
    'node_id', tt.node_id,
    'discipline_id', tt.discipline_id,
    'parent_id', tt.parent_id,
    'level', tt.level,
    'name', tt.name,
    'subject_area', tt.subject_area,
    'is_leaf', tt.is_leaf,
    'slug', tt.slug,
    'sort_order', tt.sort_order,
    'lea_id', tt.lea_id,
    'description', tt.description,
    'exam_frequency', tt.exam_frequency,
    'bloom_level', tt.bloom_level,
    'difficulty', tt.difficulty,
    'prc_area', tt.prc_area
  ), tt.node_id
  INTO v_node, v_node_id
  FROM taxonomy_tree tt
  WHERE tt.slug = p_slug
  LIMIT 1;

  IF v_node IS NULL THEN
    RETURN jsonb_build_object('article', null, 'node', null);
  END IF;

  -- Node found — resolve article via junction (prefer is_primary)
  SELECT wat.article_id INTO v_article_id
  FROM wiki_article_taxonomy wat
  WHERE wat.node_id = v_node_id AND wat.is_primary = true
  LIMIT 1;

  IF v_article_id IS NULL THEN
    SELECT wat.article_id INTO v_article_id
    FROM wiki_article_taxonomy wat
    WHERE wat.node_id = v_node_id
    LIMIT 1;
  END IF;

  IF v_article_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'article_id', wa.article_id,
      'slug', wa.slug,
      'title', wa.title,
      'content', wa.content,
      'created_at', wa.created_at,
      'updated_at', wa.updated_at,
      'lea_tests_you', wa.lea_tests_you,
      'updated_note', wa.updated_note,
      'subject_label', wa.subject_label,
      'difficulty_label', wa.difficulty_label,
      'status', wa.status
    ) INTO v_article
    FROM wiki_articles wa
    WHERE wa.article_id = v_article_id AND wa.status = 'published';
  END IF;

  RETURN jsonb_build_object('article', v_article, 'node', v_node);
END;
$$;
