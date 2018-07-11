const HTTP = require('http');
const FS = require('fs');
const Handlebars = require('handlebars');

var server = HTTP.createServer(async(req, res)=>{
  // Check for valid feed name in URL (can only contain letters, numbers, hyphens, and underscores)
  if(!(/^\/[\w\-]+(\?[\w\-]+)?$/.test(req.url))){ res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found.'); return; }
  // Check that requested feed actually exists
  const filename = `./feeds${req.url.split('?')[0]}.js`;
  if(!FS.existsSync(filename)){ res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found.'); return; }
  // Execute the requested feed to get the result
  delete require.cache[require.resolve(filename)]; // clear previously-cached requires
  const feed = require(filename);
  res.writeHead(200, { 'Content-Type': feed.contentType() });
  // Check for an unexpired cached copy and deliver that instead, if available
  if(feed.cache){
    if(!feed.cache.filename) feed.cache.filename = req.url.replace(/[^\w-]/g, '_'); // cache filename not specified, derive automatically
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
  if(feed.before) await feed.before(req);
  const template = Handlebars.compile(FS.readFileSync(`templates/${feed.template()}`).toString());
  const output = template(feed.content());
  res.end(output);
  if(feed.after) await feed.after();
  // Write to cache, if required
  if(feed.cache) FS.writeFileSync(`cache/${feed.cache.filename}`, output);
}).listen(3001);
