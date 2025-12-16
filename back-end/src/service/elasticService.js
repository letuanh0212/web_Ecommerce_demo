
require('dotenv').config();
const client = require('../config/elasticClient');
const { poolPromise } = require('../config/Sql');

const INDEX_NAME = 'items';

// Tạo index (xóa + tạo lại nếu muốn mapping mới)
async function createIndex(force = false) {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (exists.body && !force) {
      console.log(`Index "${INDEX_NAME}" already exists`);
      return;
    }
    if (exists.body && force) {
      await client.indices.delete({ index: INDEX_NAME });
      console.log(`Deleted existing index "${INDEX_NAME}"`);
    }

    await client.indices.create({
      index: INDEX_NAME,
      body: {
        settings: {
          analysis: {
            analyzer: {
              my_analyzer: {
                type: "standard",
                stopwords: "_none_"
              }
            }
          }
        },
        mappings: {
          properties: {
            id: { type: "integer" },
            name: { type: "text", analyzer: "my_analyzer" },
            description: { type: "text", analyzer: "my_analyzer" },
            category_name: { type: "text", analyzer: "my_analyzer" },
            price: { type: "float" },
            store_id: { type: "integer" },
            category_id: { type: "integer" },
            createdAt: { type: "date" },
            updatedAt: { type: "date" }
          }
        }
      }
    });

    console.log(`Index "${INDEX_NAME}" created`);
  } catch (err) {
    console.error("Error creating index:", err);
    throw err;
  }
}

async function searchItemsService(keyword) {
  if (!keyword) return [];

  try {
    const result = await client.search({
      index: INDEX_NAME,
      query: {
        multi_match: {
          query: keyword,
          fields: ["name", "description", "category_name"]
        }
      },
      size: 10
    });

    return result.hits.hits.map(h => ({
      id: h._source.id,
      name: h._source.name,
      description: h._source.description,
      price: h._source.price,
      store_id: h._source.store_id,
      category_id: h._source.category_id,
      category_name: h._source.category_name
    }));
  } catch (err) {
    console.error("Elastic search error:", err);
    throw err;
  }
}

module.exports = { createIndex, searchItemsService };
