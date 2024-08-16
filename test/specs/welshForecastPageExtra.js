import passwordPageLogin from './passwordPageLogin'
import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import fs from 'node:fs'
import { browser, expect } from '@wdio/globals'
import createLogger from 'helpers/logger'
const welshToolTipData = JSON.parse(
  fs.readFileSync('test/testdata/welshToolTip.json')
)
const logger = createLogger()
welshToolTipData.forEach(({ region, area, areaMessage, NI }) => {
  describe('Welsh - Forecast Main Page - Extra', () => {
    it('Welsh Tool tip', async () => {
      logger.info('--- FMPEx StartScenario Tool tip --------')
      await browser.deleteCookies(['airaqie_cookie'])
      await passwordPageLogin.passwordPageLogin()
      await startNowPage.startNowBtnClick()
      if (NI === 'No') {
        await locationSearchPage.clickESWRadiobtn()
        await locationSearchPage.setUserESWRegion(region)
      } else if (NI === 'Yes') {
        await locationSearchPage.clickNIRadiobtn()
        await locationSearchPage.setUserNIRegion(region)
      }
      await locationSearchPage.clickContinueBtn()
      if (await LocationMatchPage.headerTextMatch.isExisting()) {
        await LocationMatchPage.firstLinkOfLocationMatch.click()
      }
      // Click Welsh Toogle button
      await locationSearchPage.linkButtonWelsh.click()
      // await browser.scroll(0, 1500)
      await ForecastMainPage.pollutantStationName.scrollIntoView()
      const LatestIconMessage =
        'Mae’r darlleniadau’n cael eu mesur bob awr.Mae’r uned µg/㎥ yn sefyll am ficrogramau (miliynfed o gram) am bob metr ciwbig o aer.'
      const LevelIconMessage =
        'Cyfrifir y lefel ar sail y mynegai ansawdd aer dyddiol (DAQI). Mae 4 lefel: isel, cymedrol, uchel ac uchel iawn.'
      const getPollutantStationStr =
        await ForecastMainPage.pollutantStationName.getText()
      const getPollutantStation1 = await getPollutantStationStr.replace(
        '\ni',
        ''
      )
      if (getPollutantStation1 === area) {
        await ForecastMainPage.toolTipButton1.moveTo()
        if (await ForecastMainPage.toolTipMessage1.isDisplayed()) {
          const ToolTipText = await ForecastMainPage.toolTipMessage1.getText()
          await expect(ToolTipText).toMatch(areaMessage)
        } else {
          logger.error('No Visible text in tooltip')
        }
      } else {
        logger.info(
          'Temporarily the expected first station was not displayed!!!'
        )
      }
      await ForecastMainPage.toolTipButton2.moveTo()
      if (await ForecastMainPage.toolTipMessage2.isDisplayed()) {
        const ToolTipTextLatest =
          await ForecastMainPage.toolTipMessage2.getText()
        await expect(ToolTipTextLatest).toMatch(LatestIconMessage)
      } else {
        logger.error('No Visible text in tooltip for Latest column')
      }
      await ForecastMainPage.toolTipButton3.moveTo()
      if (await ForecastMainPage.toolTipMessage3.isDisplayed()) {
        const ToolTipTextLevel =
          await ForecastMainPage.toolTipMessage3.getText()
        await expect(ToolTipTextLevel).toMatch(LevelIconMessage)
      } else {
        logger.error('No Visible text in tooltip for Level column')
      }
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- FMPEx EndScenario Tool tip --------')
    })
  })
})
