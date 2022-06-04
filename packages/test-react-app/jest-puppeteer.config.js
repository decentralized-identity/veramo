module.exports = {
  launch: {
    dumpio: true,
    headless: true,
    product: "chrome",
  },
  browserContext: "default",
  server: {
    command: "npm start",
    port: 3000,
    launchTimeout: 20000,
    debug: true,
  },
};
