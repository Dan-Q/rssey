const HTTP = require('http');
const FS = require('fs');
const Puppeteer = require('puppeteer');
const Moment = require('moment');
const Handlebars = require('handlebars');

var server = HTTP.createServer(function(req, res) {
  // Check for valid feed name in URL (can only contain letters, numbers, hyphens, and underscores)
  if(!(/^\/[\w\-]+$/.test(req.url))){ res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found.'); return; }
  // Check that requested feed actually exists
  const filename = `./feeds${req.url}.js`;
  if(!FS.existsSync(filename)){ res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found.'); return; }
  // Execute the requested feed to get the result
  const feed = require(filename);
  res.writeHead(200, { 'Content-Type': feed.contentType() });
  // Check for an unexpired cached copy and deliver that instead, if available
  if(feed.cache){
    const cacheFile = `cache/${feed.cache.filename}`;
    if(FS.existsSync(cacheFile)){
      const cacheAge = Date.now() - FS.statSync(cacheFile).ctime;
      if(cacheAge <= feed.cache.lifespan){
        res.end(FS.readFileSync(cacheFile));
        return;
      }
    }
  }
  // No cached copy: proceed to generate the feed
  if(feed.before) feed.before();
  const template = Handlebars.compile(FS.readFileSync(`templates/${feed.template()}`).toString());
  const output = template(feed.content());
  res.end(output);
  if(feed.after) feed.after();
  // Write to cache, if required
  if(feed.cache) FS.writeFileSync(`cache/${feed.cache.filename}`, output)
});
server.listen(3000);
