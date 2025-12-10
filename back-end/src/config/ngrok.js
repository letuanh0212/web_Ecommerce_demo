// const ngrok = require('ngrok');

// const connectNgrok = async (port = 8080) => {
//   try {
//     // Nếu đã chạy tunnel, dùng lại URL
//     if (global.ngrokUrl) return global.ngrokUrl;

//     const url = await ngrok.connect({
//       proto: 'http',       // giao thức
//       addr: port,          // port server của bạn
//       authtoken: process.env.NGROK_TOKEN, // lưu trong .env
//       region: 'us'         // khu vực
//       // Không dùng subdomain để tránh lỗi free tier
//     });

//     global.ngrokUrl = url;
//     console.log('Ngrok public URL:', url);
//     return url;
//   } catch (err) {
//     console.error('Ngrok error:', err);
//     return null;
//   }
// };

// module.exports = connectNgrok;
