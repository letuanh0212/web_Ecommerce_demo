require
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'https://localhost:9200', // sửa localhost và https
  auth: {
    username: 'elastic',           
    password: 'UG7DN+olYravatx35z*s' 
  },
  tls: {
    rejectUnauthorized: false      
  }
});

module.exports = client;
