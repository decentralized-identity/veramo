---
'@veramo/data-store': minor
'@veramo/cli': minor
'@veramo/kv-store': minor
---

Runs on TypeORM **1.1.2**, which changes the `sqlite` driver.

- SQLite configs must change the connection `type` from `sqlite` to `better-sqlite3`. The CLI's default config is updated, but user-supplied `agent.yml` files need this edit.
- Databases created by previous versions are fully compatible.
- Where you don't use the CLI, `better-sqlite3@^13` must be added to your dependencies.
- Postgres and other drivers: no configuration changes.
