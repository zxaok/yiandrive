const axios = require('axios');

// 配置 User-Agent
const headers = {
  'User-Agent': 'okhttp'
};

// 获取视频链接的函数
const fetchVideoUrl = async (videoPath) => {
  const url = `http://dns.yiandrive.com:16813/${videoPath}`;
  
  try {
    // 发起请求，并禁用自动重定向
    const response = await axios.get(url, {
      headers,
      maxRedirects: 0
    });

    // 如果是 302 重定向，获取视频的最终 URL
    if (response.status === 302) {
      return response.headers.location;
    }

    throw new Error('No redirect location found');
  } catch (error) {
    console.error('Error fetching video URL:', error.message);
    throw new Error('Failed to fetch video URL');
  }
};

// API 路由处理
module.exports = async (req, res) => {
  // 从 URL 中提取路径部分（例如 'yy/1355652820' 或 'bilibili/23138275'）
  const videoPath = req.url.slice(1);  // 获取路径部分（去掉前导的斜杠）

  if (!videoPath) {
    return res.status(400).send('Missing video path');
  }

  try {
    // 获取最终的视频链接
    const videoUrl = await fetchVideoUrl(videoPath);
    
    // 重定向到视频链接
    res.redirect(videoUrl);
  } catch (error) {
    // 出现错误时返回 500 错误
    res.status(500).send('Error fetching video URL');
  }
};
