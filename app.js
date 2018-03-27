const HTTP = require('http');
const FS = require('fs');
const Puppeteer = require('puppeteer');
const Moment = require('moment');
const Handlebars = require('handlebars');

var server = HTTP.createServer(function(req, res) {
  // Check for valid feed name in URL (can only contain letters, numbers, hyphens, underscores, and full stops/periods)
  if(!(/^\/[\w\-\.]+$/.test(req.url))){ res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found.'); return; }
  // Check that requested feed actually exists
  const filename = `./feeds${req.url}.js`;
  if(!FS.existsSync(filename)){ res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found.'); return; }
  // Execute the requested feed to get the result
  const feed = require(filename);
  if(feed.before) feed.before();
  res.writeHead(200, { 'Content-Type': feed.contentType() });
  const template = Handlebars.compile(FS.readFileSync(`templates/${feed.template()}`).toString());
  const output = template(feed.content());
  res.end(output);
  if(feed.after) feed.after();
});
server.listen(3000);
