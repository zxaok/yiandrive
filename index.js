const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const url = 'http://dns.yiandrive.com:16813/yy/1355652820';
  const userAgent = 'okhttp'; // 设置 User-Agent 为 okhttp

  try {
    // 发送请求并跟随重定向
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow', // 确保跟随重定向
      headers: {
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 获取最终重定向的 URL
    const finalUrl = response.url;

    return res.status(200).json({ videoLink: finalUrl });
  } catch (error) {
    console.error('Error fetching video link:', error);
    return res.status(500).json({ error: error.message });
  }
};
