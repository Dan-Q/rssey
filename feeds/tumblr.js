// Generic Tumblr proxy to evade Tumblr's EU-unfriendly post-GDPR splash page
// Go to /tumblr?blogname

// Requirements: Puppeteer, Moment.js
const Puppeteer = require('puppeteer');
const LIMIT = 60;
const TTL = 720; // 12 hours

// Optional - details of the cache file to use
exports.cache = {                   // filename not specified, so will be automatically generated based on url
  lifespan: 6 * 60 * 60 * 1000      // in milliseconds, so 6 * 60 * 60 * 1000 = 6 hours
}

// Before producing output, connect to the site and fetch the data
var body = '';
exports.before = async(req)=>{
  const blog = (req.url.split('?')[1] || '');
  if(blog == '') {
    body = 'You need to specify the Tumblr blog to follow, after a question mark, e.g. /tumblr?someblog';
    return;
  }
  const blogUrl = `https://${blog}.tumblr.com/rss`;
  const browser = await Puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(blogUrl);
  await page.click('button[data-submit="agree"]');
  await page.waitForNavigation();
  let response = await page.goto(blogUrl);
  body = await response.text();
  await browser.close();
}

// MIME type for the result
exports.contentType = ()=> "application/rss+xml";

// Template to process through
exports.template = ()=> "plain.txt";

// Content to pipe to the template
exports.content = ()=> {
  return {
    body: body
  }
}
