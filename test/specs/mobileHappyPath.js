import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import { browser } from '@wdio/globals'
import fs from 'node:fs'
import createLogger from '../helpers/logger.js'

const dynlocationValue = JSON.parse(
  fs.readFileSync('test/testdata/dynamicForecast.json')
)
const logger = createLogger()

dynlocationValue.forEach(({ region, nearestRegionForecast, NI }) => {
  describe(`Browser Stack Mobile Test - ${region}`, () => {
    it('Mobile test validation', async () => {
      logger.info('--- MobileTestValidation StartScenario --------')

      // Initialize browser and handle cookies - delete ALL cookies to ensure clean state
      await browser.deleteCookies()

      // Navigate to homepage with explicit wait for page load
      await browser.url('')
      await browser.waitUntil(
        async () =>
          await browser.execute(() => document.readyState === 'complete'),
        { timeout: 5000, timeoutMsg: 'Page did not load completely' }
      )

      // Handle the cookie banner - wait for it to appear
      await cookieBanner.cookieBannerDialog.waitForDisplayed({ timeout: 5000 })
      await cookieBanner.rejectButtonCookiesDialog.waitForClickable({
        timeout: 5000
      })
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()

      // Navigate to forecast page
      await startNowPage.startNowBtnClick()
      if (NI === 'No') {
        await locationSearchPage.clickESWRadiobtn()
        await locationSearchPage.setUserESWRegion(region)
      } else if (NI === 'Yes') {
        await locationSearchPage.clickNIRadiobtn()
        await locationSearchPage.setUserNIRegion(region)
      }

      // Add an explicit wait for the continue button to be clickable
      await locationSearchPage.continueBtn.waitForClickable({ timeout: 5000 })
      // Check if continue button is displayed and enabled before clicking
      const isDisplayed = await locationSearchPage.continueBtn.isDisplayed()
      const isEnabled = await locationSearchPage.continueBtn.isEnabled()
      logger.info(
        `Continue button displayed: ${isDisplayed}, enabled: ${isEnabled}`
      )
      if (!isDisplayed) {
        throw new Error('Continue button is not displayed')
      }
      if (!isEnabled) {
        throw new Error('Continue button is not enabled')
      }
      // Click on the body to dismiss the mobile keyboard
      await browser.execute(() => {
        document.body.click()
      })
      await locationSearchPage.clickContinueBtn()

      if (await LocationMatchPage.headerTextMatch.isExisting()) {
        await LocationMatchPage.firstLinkOfLocationMatch.click()
        // Wait for navigation to complete after clicking location match link
        await browser.waitUntil(
          async () => {
            const url = await browser.getUrl()
            return url.includes('forecast') || url.includes('region')
          },
          {
            timeout: 10000,
            timeoutMsg:
              'Navigation did not complete after clicking location match'
          }
        )
      }

      // Wait for the forecast page to load completely
      await browser.waitUntil(
        async () =>
          await browser.execute(() => document.readyState === 'complete'),
        { timeout: 5000, timeoutMsg: 'Forecast page did not load completely' }
      )

      // Wait for mobile forecast elements to be present
      const firstMobileDayElement = await $("span[class='daqi-day-full']")
      await firstMobileDayElement.waitForDisplayed({
        timeout: 10000,
        timeoutMsg: 'Mobile forecast days did not appear'
      })

      // Validate mobile view DAQI forecast days
      const daqiDaysMobile = await ForecastMainPage.daqiForecastDaysFullMobile
      const daqiDaysTextMobile = []
      for (const dayElement of daqiDaysMobile) {
        const dayText = await dayElement.getText()
        daqiDaysTextMobile.push(dayText)
      }
      // Fetch the next 4 days starting from tomorrow
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]
      const today = new Date()
      const todayIndex = today.getDay()
      const next4Days = []

      for (let i = 1; i <= 4; i++) {
        const futureIndex = (todayIndex + i) % days.length
        next4Days.push(days[futureIndex])
      }

      // Use only the next 4 days as expected
      const expectedDays = next4Days

      // Compare the result with daqiDaysTextMobile
      await expect(daqiDaysTextMobile).toMatchObject(expectedDays)
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- MobileTestValidation EndScenario --------')
    })
  })
})
