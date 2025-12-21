# Synonyms & Index helper

Files added:

- `synonyms.txt` — list of synonym groups for Vietnamese ↔ English.
- `scripts/create_products_index.js` — Node.js script to create an index with a `synonym_graph` analyzer and optionally reindex from an old index.

Quick run (from project root):

```bash
cd back-end
# dry-run to verify actions
node ./scripts/create_products_index.js --dry-run

# create index (delete if exists)
node ./scripts/create_products_index.js --force

# create and reindex from existing index 'products'
node ./scripts/create_products_index.js --force --reindex-from=products
```

Options:

- `--new-index=<name>`: set custom index name (default `products_syn`).
- `--reindex-from=<oldIndex>`: reindex documents from the old index into the new one.
- `--force`: delete an existing target index before creating.
- `--dry-run`: print actions without contacting Elasticsearch.

Environment:

- `ELASTICSEARCH_URL` can be set to change the ES node URL (default `http://localhost:9200`).
