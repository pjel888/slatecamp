# Secrets and Credentials

## Rule

Secrets stay out of chat, commits, logs, reports, and generated documents.

## Sensitive categories

- API keys and provider tokens.
- Auth session cookies.
- Private keys and signing secrets.
- Database URLs and passwords.
- Production credentials.
- User private data.

## Agent behavior

- Use environment placeholders in examples.
- Redact sensitive values in summaries.
- Do not request secret values in normal chat; direct the user to local secure setup.
- Do not add secrets to `config.yaml`; use `.env` or provider setup.
