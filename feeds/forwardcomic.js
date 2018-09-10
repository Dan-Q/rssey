// Sample RSS feed of forwardcomic.com
// Uses http://forwardcomic.com/list.php to get a list of the comics

// Requirements: Puppeteer, Moment.js
const Puppeteer = require('puppeteer');
const Moment = require('moment');
const DATE_RFC2822 = 'ddd, DD MMM YYYY HH:mm:ss ZZ';
const LIST_URL = 'http://forwardcomic.com/list.php';
const LIMIT = 60;
const TTL = 720; // 12 hours

// Optional - details of the cache file to use
exports.cache = {
  filename: 'forwardcomic.rss.xml', // must be unique in this installation
  lifespan: 6 * 60 * 60 * 1000      // in milliseconds, so 6 * 60 * 60 * 1000 = 6 hours
}

// Before producing output, connect to the site and fetch the data
var items = [];
exports.before = async()=>{
  const browser = await Puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto(LIST_URL);
  items = await page.evaluate(() => {
    return([...document.querySelectorAll('.class1 a')].reverse().map(function(a){
      const dateText = ((a.nextSibling.nodeValue || '').match(/\d{4}\.\d{2}\.\d{2}/) || [])[0];
      return {
        title: a.innerText,
        link: a.href,
        guid: a.href,
        dateText: dateText
      }
    }));
  });
  items = items.slice(0, LIMIT).map(function(item){
    return {
      title: item.title,
      link: item.link,
      guid: item.link,
      pubDate: Moment(`${item.dateText} +0000`, 'YYYY.MM.DD Z').utc().format(DATE_RFC2822)
    }  });
  await browser.close();
}

// MIME type for the result
exports.contentType = ()=> "application/rss+xml";

// Template to process through
exports.template = ()=> "rss.xml";

// Content to pipe to the template
exports.content = ()=> {
  return {
    title: 'Forward Comic',
    link: LIST_URL,
    pubDate: Moment().utc().format(DATE_RFC2822),
    lastBuildDate: items[0].pubDate,
    ttl: TTL,
    items: items
  }
}
