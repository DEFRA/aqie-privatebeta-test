import createLogger from 'helpers/logger'
const assert = require('assert')

const logger = createLogger()
describe('Check all links', () => {
  it('should verify all links are working and output total links verified', async () => {
    await browser.url('') // Replace with your website URL

    const links = await $$('a') // Select all anchor tags
    let totalLinks = 0
    const brokenLinks = []
    const workingLinks = []

    for (const link of links) {
      const url = await link.getAttribute('href')
      if (url) {
        totalLinks++
        await browser.newWindow(url)
        const status = await browser.getUrl()
        if (status === 'about:blank') {
          brokenLinks.push(url)
        } else {
          workingLinks.push(url)
        }
        await browser.closeWindow()
        await browser.switchWindow('') // Switch back to the main window
      }
    }
    logger.info(`Total links verified: ${totalLinks}`)
    let flag = 'true'
    if (brokenLinks.length > 0) {
      flag = 'false'
      await expect(flag).toMatch('true')
      logger.info('Broken links:')
      brokenLinks.forEach((link) => logger.info(link))
    } else {
      logger.info('No broken links found.')
      for (const value of workingLinks) {
        logger.info(`Current value: ${value}`)
      }
    }

    assert(brokenLinks.length === 0, 'There are broken links on the page.')
  })
})
