module.exports = (path, options) => {
    if (path === "./proto/payload" && options.basedir.includes("libp2p-noise")) {
        console.log("options: ", options)
        const val = options.defaultResolver(path, options)
        const modified = val.replace("payload.ts", "payload.js")
        return modified
    }
    // Call the defaultResolver, so we leverage its cache, error handling, etc.
    return options.defaultResolver(path, options);
  };