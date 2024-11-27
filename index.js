import fetch from 'node-fetch';

let lastFetchedUrl = null; // 缓存最后的 URL
let lastFetchTime = 0; // 缓存最后获取的时间

module.exports = async (req, res) => {
  const baseUrl = 'http://dns.yiandrive.com:16813'; // 基本目标 URL
  const userAgent = 'okhttp'; // 设置 User-Agent 为 okhttp

  // 提取 URL 中的后缀部分（例如 /douyu/122402）
  const { slug } = req.query;
  const fullUrl = `${baseUrl}${slug ? `/${slug}` : ''}`; // 拼接目标 URL
  
  try {
    const currentTime = Date.now();

    // 如果缓存的时间小于10分钟，直接使用缓存的URL
    if (lastFetchedUrl && currentTime - lastFetchTime < 10 * 60 * 1000) {
      console.log('Returning cached URL');
      return res.redirect(lastFetchedUrl); // 直接重定向到缓存的URL
    }

    // 发送请求并跟随重定向
    const response = await fetch(fullUrl, {
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

    // 缓存结果和时间
    lastFetchedUrl = finalUrl;
    lastFetchTime = currentTime;

    console.log('Returning new URL');
    // 直接重定向到最终的 URL，无论是 .m3u8 还是 .flv
    return res.redirect(finalUrl);
  } catch (error) {
    console.error('Error fetching video link:', error);
    return res.status(500).send('Internal Server Error');
  }
};
