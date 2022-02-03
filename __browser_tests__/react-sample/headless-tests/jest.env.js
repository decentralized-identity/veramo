const JestEnvironment = require('jest-environment-puppeteer-jsdom')

export default class CustomEnvironment extends JestEnvironment {
  constructor(config) {
    super(config)
  }

  async setup() {
    await super.setup()
    await this.global.page.goto('http://localhost:3000')
    await this.global.page.waitFor(() => typeof window.agent !== 'undefined')
    this.global.agent = await this.global.page.evaluate(() => window.agent)
    console.log(typeof this.global.agent, this.global.agent)
  }

  async teardown() {
    await super.teardown()
  }

  runScript(script) {
    return super.runScript(script)
  }
}
