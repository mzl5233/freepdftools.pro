// 本地开发服务器，正确处理MIME类型
const express = require('express');
const path = require('path');
const app = express();

// 设置MIME类型
app.use((req, res, next) => {
  if (req.path.endsWith('.jsx')) {
    res.type('application/javascript');
  }
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// SPA路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`访问: http://localhost:${PORT}`);
}); 