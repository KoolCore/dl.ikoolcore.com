const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 80;

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 处理文件列表请求
app.get('/idx/*', (req, res) => {
  try {
    // 获取请求的路径
    let requestPath = req.path.replace(/^\/idx\//, '');
    // 解码URL
    requestPath = decodeURIComponent(requestPath);
    // 移除查询参数
    requestPath = requestPath.split('?')[0];
    // 移除多余的斜杠
    requestPath = requestPath.replace(/\/\/+/g, '/').replace(/(^\/+)|(\/+$)/g, '');
    
    // 构建完整的文件系统路径 - 从files文件夹下获取
    const fullPath = path.join(__dirname, 'files', requestPath);
    
    // 检查路径是否存在
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }
    
    // 检查是否是目录
    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Not a directory' });
    }
    
    // 读取目录内容
    const files = fs.readdirSync(fullPath);
    
    // 处理搜索查询
    const searchQuery = req.query.q;
    let filteredFiles = files;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredFiles = files.filter(file => 
        file.toLowerCase().includes(query)
      );
    }
    
    // 格式化文件列表
    const fileList = filteredFiles.map(file => {
      const filePath = path.join(fullPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        lastModified: stats.mtime
      };
    });
    
    // 按类型排序：目录在前，文件在后
    fileList.sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });
    
    res.json(fileList);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 处理文件下载请求
app.get('/dl/*', (req, res) => {
  try {
    // 获取请求的路径
    let requestPath = req.path.replace(/^\/dl\//, '');
    // 解码URL
    requestPath = decodeURIComponent(requestPath);
    // 构建完整的文件系统路径 - 从files文件夹下获取
    const fullPath = path.join(__dirname, 'files', requestPath);
    
    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return res.status(404).send('File not found');
    }
    
    // 检查是否是文件
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return res.status(400).send('Not a file');
    }
    
    // 发送文件
    res.sendFile(fullPath);
  } catch (error) {
    console.error('Error processing download request:', error);
    res.status(500).send('Internal server error');
  }
});

// 处理根路径请求
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
const serverPort = port;
app.listen(serverPort, () => {
  console.log(`iKOOLCORE Download Center running on port ${serverPort}`);
  if (serverPort === 80) {
    console.log(`Access the download center at http://${require('os').hostname()}`);
  } else {
    console.log(`Access the download center at http://${require('os').hostname()}:${serverPort}`);
  }
});
