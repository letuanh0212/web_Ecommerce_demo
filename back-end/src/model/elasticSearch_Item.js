// const client = require('../config/elasticClient');

// const INDEX_NAME = 'items';

// async function createIndex() {
//   try {
//     const exists = await client.indices.exists({ index: INDEX_NAME });
//     if (!exists.body) {
//       await client.indices.create({
//         index: INDEX_NAME,
//         body: {
//           mappings: {
//             properties: {
//               id: { type: 'integer' },
//               name: { type: 'text' },
//               description: { type: 'text' },
//               price: { type: 'float' },
//               store_id: { type: 'integer' },
//               category_id: { type: 'integer' },
//               createdAt: { type: 'date' },
//               updatedAt: { type: 'date' }
//             }
//           }
//         }
//       });
//       console.log('Index "items" created');
//     } else {
//       console.log('Index "items" already exists');
//     }
//   } catch (err) {
//     console.error('Error creating index:', err);
//   }
// }

// module.exports = { createIndex };


const client = require('../config/elasticClient');

const INDEX_NAME = 'items';

async function createIndex() {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (!exists.body) {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'text' },
              description: { type: 'text' },
              price: { type: 'float' },
              store_id: { type: 'integer' },
              category_id: { type: 'integer' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      });
      console.log('Index "items" created');
    } else {
      console.log('Index "items" already exists');
    }
  } catch (err) {
    if (err.meta?.body?.error?.type === 'resource_already_exists_exception') {
      console.log('Index already exists, skipping creation.');
    } else {
      console.error('Error creating index:', err);
    }
  }
}

module.exports = { createIndex };
