import { jest } from '@jest/globals'

jest.setTimeout(30000)

describe('Browser integration tests', () => {
  describe('should intialize in the react app', () => {
    beforeAll(async () => {
      await page.goto('https://google.com')
    })

    it('should say ok', async () => {
        let text = await page.evaluate(() => document.body.textContent)
        expect(text).toContain('google')
    })
  })
})
