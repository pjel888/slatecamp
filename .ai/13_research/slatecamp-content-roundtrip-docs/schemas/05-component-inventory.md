# Schema: component-inventory/components.json

```json
{
  "generated_at": "string",
  "repo_root": "string",
  "component_count": 0,
  "components": [
    {
      "component_name": "string",
      "file_path": "string",
      "export_type": "default | named | anonymous_default | unknown",
      "props_type_name": "string | null",
      "prop_names": ["string"],
      "required_props": ["string"],
      "optional_props": ["string"],
      "child_support": "yes | no | unknown",
      "imports": ["string"],
      "used_components": ["string"],
      "has_interactivity": true,
      "uses_client_directive": true,
      "uses_state": true,
      "uses_effect": true,
      "uses_supabase": false,
      "likely_article_embeddable": true,
      "confidence": "low | medium | high",
      "reason": "string",
      "raw_snippet": "string"
    }
  ]
}
```
