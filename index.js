const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const url = 'http://dns.yiandrive.com:16813/yy/1355652820';
  const userAgent = 'okhttp'; // 使用字符串形式的 User-Agent

  try {
    // 发起请求，设置 User-Agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const videoLink = await response.text();
    return res.status(200).json({ videoLink });
  } catch (error) {
    console.error('Error fetching video link:', error);
    return res.status(500).json({ error: error.message });
  }
};
