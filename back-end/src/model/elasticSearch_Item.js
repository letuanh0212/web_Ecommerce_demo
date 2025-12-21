

const client = require('../config/elasticClient');
const fs = require('fs');
const path = require('path');

const INDEX_NAME = 'items';

async function createIndex(force = false) {
  try {
    // Load synonyms from file
    const synonymsPath = path.join(__dirname, '..', '..', 'elastic', 'synonyms.txt');
    let synonyms = [];
    
    if (fs.existsSync(synonymsPath)) {
      synonyms = fs.readFileSync(synonymsPath, 'utf8')
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));
      console.log(`Loaded ${synonyms.length} synonym groups from synonyms.txt`);
    } else {
      console.warn(`Synonyms file not found at ${synonymsPath}, proceeding without synonyms`);
    }

    const exists = await client.indices.exists({ index: INDEX_NAME });
    const indexExists = exists && exists.body !== undefined ? exists.body : exists;
    
    if (indexExists && !force) {
      console.log(`Index "${INDEX_NAME}" already exists`);
      return;
    }
    if (indexExists) {
      await client.indices.delete({ index: INDEX_NAME });
      console.log(`Deleted existing index "${INDEX_NAME}"`);
    }

    const settings = {
      analysis: {
        filter: {
          vi_en_synonym: {
            type: 'synonym_graph',
            synonyms: synonyms
          }
        },
        analyzer: {
          synonym_analyzer: {
            tokenizer: 'standard',
            filter: ['lowercase', 'asciifolding', 'vi_en_synonym']
          }
        }
      }
    };

    await client.indices.create({
      index: INDEX_NAME,
      body: {
        settings: settings,
        mappings: {
          properties: {
            id: { type: 'integer' },
            name: { type: 'text', analyzer: 'synonym_analyzer', search_analyzer: 'synonym_analyzer', fields: { keyword: { type: 'keyword' } } },
            description: { type: 'text', analyzer: 'synonym_analyzer', search_analyzer: 'synonym_analyzer' },
            category_name: { type: 'text', analyzer: 'synonym_analyzer', search_analyzer: 'synonym_analyzer' },
            image: { type: 'keyword' },
            price: { type: 'float' },
            store_id: { type: 'integer' },
            category_id: { type: 'integer' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });

    console.log(`Index "${INDEX_NAME}" created with synonym_analyzer`);
  } catch (err) {
    if (err.meta?.body?.error?.type === 'resource_already_exists_exception') {
      console.log('Index already exists, skipping creation.');
    } else {
      console.error('Error creating index:', err);
    }
  }
}

module.exports = { createIndex };
