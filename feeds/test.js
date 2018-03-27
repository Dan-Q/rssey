// Dummy test feed; does nothing of interest

// Optional - things to do BEFORE the feed runs
exports.before = ()=>{
}

// MIME type for the result
exports.contentType = ()=> "text/plain";

// Template to process through
exports.template = ()=> "plain.txt";

exports.content = ()=> {
  return {
    body: "actually the test feed now 2"
  }
}

// Optional - things to do AFTER the feed runs
exports.after = ()=>{
}
