// Sample RSS feed of webdevbev.co.uk's blog

// Requirements: Puppeteer, Moment.js
const Puppeteer = require('puppeteer');
const Moment = require('moment');
const DATE_RFC2822 = 'ddd, DD MMM YYYY HH:mm:ss ZZ';
const LIST_URL = 'https://webdevbev.co.uk/blog.html';
const LIMIT = 60;
const TTL = 720; // 12 hours

// Optional - details of the cache file to use
exports.cache = {
  filename: 'webdevbevblog.rss.xml', // must be unique in this installation
  lifespan: 6 * 60 * 60 * 1000      // in milliseconds, so 6 * 60 * 60 * 1000 = 6 hours
}

// Before producing output, connect to the site and fetch the data
var items = [];
exports.before = async()=>{
  const browser = await Puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(LIST_URL);
  items = await page.evaluate(() => {
    return([...document.querySelectorAll('main li a:first-child')].map(function(a){
      return {
        title: a.innerText,
        link: a.href,
        guid: a.href
      }
    }));
  });
  items = items.slice(0, LIMIT);
  await browser.close();
}

// MIME type for the result
exports.contentType = ()=> "application/rss+xml";

// Template to process through
exports.template = ()=> "rss.xml";

// Content to pipe to the template
exports.content = ()=> {
  return {
    title: 'WebDevBev Blog',
    link: LIST_URL,
    pubDate: Moment().utc().format(DATE_RFC2822),
    ttl: TTL,
    items: items
  }
}
