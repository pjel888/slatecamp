# Future AI Review Notes

The UI should remain provider-agnostic.

Future AI outputs should be able to create:

- runs,
- items,
- findings,
- change proposals,
- status cache updates.

Do not hard-code Kimi/Qwen/DeepSeek into the UI. The provider column can display any string.

Future providers likely:

```text
manual
local_script
kimi
qwen
deepseek
openai
perplexity
```

Valyu is not part of the MVP.

The admin UI should support future provider results through existing generic fields:

```text
provider
model
prompt_version
raw_output
metadata
```
