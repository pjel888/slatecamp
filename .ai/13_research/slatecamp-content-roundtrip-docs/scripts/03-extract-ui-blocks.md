# Script Spec: Extract UI Blocks

## Block detection targets

```text
Self-closing capitalized tags
Paired capitalized tags
Namespaced component tags
Shortcodes
Raw HTML interactive blocks
Fenced JSON/component blocks
```

## UI block object

Each extracted block should include:

```text
block_id
component_name
raw
placeholder
start_offset
end_offset
line_start
line_end
props_text
props_json
children_raw
children_text
parse_status
warnings
```

## Text extraction

If children contain text, extract text for review but keep raw unchanged.

## Props extraction

Parse simple string/number/boolean props when safe. Keep raw props text regardless.
