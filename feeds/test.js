// Dummy test feed; does nothing of interest

// Optional - things to do BEFORE the feed runs
exports.before = ()=>{
}

// Optional - details of the cache file to use
exports.cache = {
  filename: 'test.plain.txt', // must be unique in this installation
  lifespan: 10 * 1000         // in milliseconds, so 10 * 1000 = 10 seconds
}

// MIME type for the result
exports.contentType = ()=> "text/plain";

// Template to process through
exports.template = ()=> "plain.txt";

// Content to pipe to the template
exports.content = ()=> {
  return {
    body: "This was the test feed."
  }
}

// Optional - things to do AFTER the feed runs
exports.after = ()=>{
}
