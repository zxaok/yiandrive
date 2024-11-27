const axios = require('axios');

// 配置 User-Agent
const headers = {
  'User-Agent': 'okhttp'
};

// 缓存对象，用于存储 URL 和缓存时间
const cache = {};

// 缓存有效期（单位：毫秒），这里设置为 10 分钟
const CACHE_TTL = 10 * 60 * 1000;

// 获取视频链接的函数
const fetchVideoUrl = async (videoPath) => {
  const url = `http://dns.yiandrive.com:16813/${videoPath}`;
  
  try {
    // 发起请求，并禁用自动重定向
    const response = await axios.get(url, {
      headers,
      maxRedirects: 0  // 禁用自动重定向
    });

    // 如果是 302 重定向，获取视频的最终 URL
    if (response.status === 302) {
      console.log(`302 Redirect found for ${videoPath}. Redirecting to: ${response.headers.location}`);
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

  // 检查缓存
  const now = Date.now();
  const cached = cache[videoPath];

  // 如果缓存存在且未过期，直接返回缓存的 URL
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached URL for', videoPath);
    return res.redirect(cached.url);  // 返回缓存的重定向 URL
  }

  try {
    // 获取最终的视频链接
    const videoUrl = await fetchVideoUrl(videoPath);

    // 缓存新的 URL 和时间戳
    cache[videoPath] = {
      url: videoUrl,
      timestamp: now
    };
    
    // 重定向到视频链接
    res.redirect(videoUrl);
  } catch (error) {
    // 出现错误时返回 500 错误
    res.status(500).send('Error fetching video URL');
  }
};
