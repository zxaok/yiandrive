const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const url = 'http://dns.yiandrive.com:16813/yy/1355652820';
  const userAgent = 'okhttp';

  try {
    // 发起 GET 请求，添加自定义 User-Agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': okhttp/3,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch the video link' });
    }

    // 解析返回内容为字符串
    const videoLink = await response.text();

    // 返回视频链接
    return res.status(200).json({ videoLink });
  } catch (error) {
    console.error('Error fetching video link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
