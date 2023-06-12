module.exports = {
  launch: {
    dumpio: true,
    headless: 'new',
    product: 'chrome',
  },
  browserContext: 'default',
  server: {
    command: 'pnpm start',
    port: 3000,
    launchTimeout: 30000,
    debug: true,
  },
}
