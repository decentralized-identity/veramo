module.exports = (path, options) => {
    if (path === "./proto/payload") {
        const val = options.defaultResolver(path, options)
        const modified = val.replace("payload.ts", "payload.js")
        return modified
    }
    // Call the defaultResolver, so we leverage its cache, error handling, etc.
    return options.defaultResolver(path, options);
  };