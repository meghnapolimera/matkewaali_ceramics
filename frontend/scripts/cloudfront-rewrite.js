function handler(event) {
    var uri = event.request.uri;
    // Rewrite extensionless paths to /path/index.html so S3 serves pre-rendered HTML.
    // Paths with extensions (*.js, *.css, *.txt) and the root / are left untouched.
    if (!uri.endsWith('/') && !uri.match(/\.[^/]+$/)) {
        event.request.uri = uri + '/index.html';
    }
    return event.request;
}
