# Config Merge Notes

Do not overwrite an existing `config.yaml` if Hermes is already working. Merge cautiously.

## Safe sections to copy

- `approvals`
- `checkpoints`
- `compression`
- `tool_output`
- `tool_loop_guardrails`
- `skills.external_dirs`

## Sections to preserve from your current config

- `model`
- `providers`
- `fallback_providers`
- any provider-specific credentials or endpoints
- platform/gateway settings
- custom terminal backend settings

## After merge

```bash
hermes config check
hermes doctor
```
