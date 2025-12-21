const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

// ============================================
// ELASTICSEARCH CLIENT SETUP
// ============================================
// Kết nối đến Elasticsearch node
// Mặc định: https://localhost:9200 (HTTPS - Elasticsearch 8.0+ secure by default)
// Có thể override bằng env var ELASTICSEARCH_URL
const ES_URL = process.env.ELASTICSEARCH_URL || 'https://localhost:9200';
const ES_USERNAME = process.env.ELASTICSEARCH_USERNAME || 'elastic';
const ES_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || 'UG7DN+olYravatx35z*s';

const client = new Client({ 
  node: ES_URL,
  auth: {
    username: ES_USERNAME,
    password: ES_PASSWORD
  },
  tls: {
    rejectUnauthorized: false  // Cho phép self-signed certs
  }
});

// ============================================
// USAGE HELPER
// ============================================
// Hướng dẫn cách chạy script
function usage() {
  console.log(`Usage: node create_products_index.js [--new-index name] [--reindex-from oldIndex] [--force] [--dry-run]`);
}

// ============================================
// REUSABLE FUNCTION
// ============================================
// Hàm tạo index có thể gọi từ code khác (server.js)
async function createIndex({ newIndex = 'products_syn', force = false, reindexFrom = null, dry = false, esUrl = null } = {}) {
  const node = esUrl || ES_URL;
  const localClient = new Client({ 
    node,
    auth: {
      username: ES_USERNAME,
      password: ES_PASSWORD
    },
    tls: {
      rejectUnauthorized: false  // Cho phép self-signed certs
    }
  });

  const synonymsPath = path.join(__dirname, '..', 'elastic', 'synonyms.txt');
  if (!fs.existsSync(synonymsPath)) {
    throw new Error('Missing synonyms file at ' + synonymsPath);
  }

  const synonyms = fs.readFileSync(synonymsPath, 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  if (dry) return { dry: true, synonymsLoaded: synonyms.slice(0, 20) };

  const exists = await localClient.indices.exists({ index: newIndex });
  if (exists) {
    if (!force) {
      throw new Error(`Index '${newIndex}' already exists. Use force=true to delete and recreate.`);
    }
    await localClient.indices.delete({ index: newIndex });
  }

  const body = {
    settings: {
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
    },
    mappings: {
      properties: {
        name: { type: 'text', analyzer: 'synonym_analyzer', fields: { keyword: { type: 'keyword' } } },
        description: { type: 'text', analyzer: 'synonym_analyzer' },
        sku: { type: 'keyword' },
        price: { type: 'double' }
      }
    }
  };

  await localClient.indices.create({ index: newIndex, body });

  if (reindexFrom) {
    await localClient.reindex({
      wait_for_completion: true,
      body: { source: { index: reindexFrom }, dest: { index: newIndex } }
    });
  }

  return { created: true, index: newIndex };
}

// ============================================
// MAIN FUNCTION
// ============================================
async function run() {
  // ---- Parse command line arguments ----
  // Lấy các tham số từ dòng lệnh
  const args = process.argv.slice(2);
  
  // --force: Xóa index cũ nếu tồn tại
  const force = args.includes('--force');
  
  // --dry-run: Chỉ hiển thị những gì sẽ làm, không thực hiện
  const dry = args.includes('--dry-run');
  
  // --reindex-from=oldIndex: Sao chép dữ liệu từ index cũ
  const reindexArg = args.find(a => a.startsWith('--reindex-from='));
  
  // --new-index=name: Tên index mới (mặc định: 'products_syn')
  const newIndexArg = args.find(a => a.startsWith('--new-index='));

  // Trích xuất giá trị từ arguments
  const reindexFrom = reindexArg ? reindexArg.split('=')[1] : null;
  const newIndex = newIndexArg ? newIndexArg.split('=')[1] : 'products_syn';

  // ---- Load Synonyms ----
  // Đường dẫn đến file chứa từ đồng nghĩa
  const synonymsPath = path.join(__dirname, '..', 'elastic', 'synonyms.txt');
  
  // Kiểm tra file synonyms có tồn tại không
  if (!fs.existsSync(synonymsPath)) {
    console.error('Missing synonyms file at', synonymsPath);
    usage();
    process.exit(1);
  }

  // Đọc file synonyms, loại bỏ comments và dòng trống
  const synonyms = fs.readFileSync(synonymsPath, 'utf8')
    .split(/\r?\n/)                    // Tách từng dòng
    .map(l => l.trim())                // Loại bỏ khoảng trắng
    .filter(l => l && !l.startsWith('#')); // Loại bỏ comments (#) và dòng trống

  // ---- Hiển thị thông tin ----
  console.log('Elasticsearch URL:', ES_URL);
  console.log('New index will be:', newIndex);
  if (reindexFrom) console.log('Will reindex from:', reindexFrom);
  
  // ---- DRY RUN MODE ----
  // Nếu --dry-run: chỉ hiển thị, không thực hiện
  if (dry) {
    console.log('\nDRY RUN - actions that would be performed:');
    console.log('- Create index with synonym_graph analyzer (using synonyms from', synonymsPath + ')');
    if (force) console.log('- Delete existing index if exists (--force)');
    if (reindexFrom) console.log('- Reindex from', reindexFrom, 'into', newIndex);
    console.log('\nSynonyms loaded (first 20 lines):');
    console.log(synonyms.slice(0, 20).join('\n'));
    process.exit(0);
  }

  try {
    // ============================================
    // BƯỚC 1: Kiểm tra index có tồn tại không
    // ============================================
    const exists = await client.indices.exists({ index: newIndex });
    
    if (exists) {
      // Nếu tồn tại và không có --force, dừng
      if (!force) {
        console.error(`Index '${newIndex}' already exists. Use --force to delete and recreate.`);
        process.exit(1);
      }
      // Nếu có --force, xóa index cũ
      console.log(`Deleting existing index '${newIndex}'...`);
      await client.indices.delete({ index: newIndex });
    }

    // ============================================
    // BƯỚC 2: Tạo Index với Synonym Analyzer
    // ============================================
    console.log('Creating index', newIndex, 'with synonym_graph analyzer...');
    
    // Config cho index
    const body = {
      // ---- SETTINGS: Định nghĩa analyzer ----
      settings: {
        analysis: {
          // Filter: Vi-En Synonym
          filter: {
            vi_en_synonym: {
              type: 'synonym_graph',  // Loại filter: synonym_graph (tối ưu hơn synonym)
              synonyms: synonyms      // Danh sách từ đồng nghĩa từ file
            }
          },
          
          // Analyzer: Quy trình xử lý text
          analyzer: {
            synonym_analyzer: {
              tokenizer: 'standard',  // Tách text thành tokens (từ)
              // Áp dụng các filter theo thứ tự
              filter: [
                'lowercase',        // Chuyển chữ hoa → thường
                'asciifolding',     // Loại bỏ diacritics (á, é, í, ó, ú → a, e, i, o, u)
                'vi_en_synonym'     // Áp dụng từ đồng nghĩa
              ]
            }
          }
        }
      },
      
      // ---- MAPPINGS: Định nghĩa cấu trúc document ----
      mappings: {
        properties: {
          // Field: name (tên sản phẩm)
          // Sử dụng synonym_analyzer cho cả indexing lẫn searching
          name: { 
            type: 'text', 
            analyzer: 'synonym_analyzer',  // Analyzer cho indexing
            fields: { 
              keyword: { type: 'keyword' } // Sub-field cho exact match
            } 
          },
          
          // Field: description (mô tả sản phẩm)
          // Cũng sử dụng synonym_analyzer
          description: { 
            type: 'text', 
            analyzer: 'synonym_analyzer' 
          },
          
          // Field: sku (mã sản phẩm)
          // Keyword type: không phân tích, lưu nguyên
          sku: { type: 'keyword' },
          
          // Field: price (giá)
          // Double type: số thập phân
          price: { type: 'double' }
        }
      }
    };

    // ============================================
    // BƯỚC 3: Tạo index
    // ============================================
    // Gửi request tới Elasticsearch
    await client.indices.create({ index: newIndex, body });
    console.log('Index created:', newIndex);

    // ============================================
    // BƯỚC 4: Reindex (tuỳ chọn)
    // ============================================
    // Nếu có --reindex-from: sao chép dữ liệu từ index cũ
    if (reindexFrom) {
      console.log('Starting reindex from', reindexFrom, 'to', newIndex);
      
      // Reindex: copy toàn bộ dữ liệu từ source → destination
      const res = await client.reindex({
        wait_for_completion: true,  // Chờ hoàn thành
        body: {
          source: { index: reindexFrom },  // Index nguồn
          dest: { index: newIndex }        // Index đích
        }
      });
      console.log('Reindex response:', JSON.stringify(res, null, 2));
    }

    console.log('\nDone. Remember to update your search code to query the new index name if needed.');
  } catch (err) {
    // ============================================
    // ERROR HANDLING
    // ============================================
    console.error('Error:', err.meta ? err.meta.body || err.meta : err);
    process.exit(1);
  }
}

// ============================================
// CHẠY SCRIPT
// ============================================
run();

// Export createIndex for programmatic use (server can require this file)
module.exports = { createIndex };

