module.exports = {
  launch: {
    dumpio: true,
    headless: true,
    product: 'chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  browserContext: 'default',
  server: {
    command: 'pnpm start',
    port: 3000,
    launchTimeout: 30000,
    debug: true,
  },
}
