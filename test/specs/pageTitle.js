import { browser, expect } from '@wdio/globals'
import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import cookieBanner from 'page-objects/cookieBanner'
import o3StaticPage from 'page-objects/o3staticpage'
import no2StaticPage from 'page-objects/no2staticpage'
import so2StaticPage from 'page-objects/so2staticpage'
import pm10StaticPage from 'page-objects/pm10staticpage'
import pm25StaticPage from 'page-objects/pm25staticpage'
import footerObjects from 'page-objects/footer'
import fs from 'node:fs'
const dynlocationValue = JSON.parse(
  fs.readFileSync('test/testdata/dynamicForecast.json')
)

describe('Page Title', () => {
  dynlocationValue.forEach(
    ({
      region,
      nearestRegionForecast,
      nearestRegionPollutantsSta1,
      nearestRegionPollutantsSta2,
      nearestRegionPollutantsSta3,
      NI
    }) => {
      it('Page title', async () => {
        await browser.deleteCookies(['airaqie_cookie'])
        await browser.url('')
        await browser.maximizeWindow()
        // Handle the cookie banner
        if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
          await cookieBanner.rejectButtonCookiesDialog.click()
          await cookieBanner.hideButtonHideDialog.click()
        }
        // start now page
        const StartPageHeaderText = 'Check air quality'
        const getStartPageHeaderText =
          await startNowPage.startNowPageHeaderText.getText()
        await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
        const startNowPageTitle = await browser.getTitle()
        await expect(startNowPageTitle).toMatch('Check air quality - GOV.UK')
        // welsh check
        await startNowPage.toWelshTranslationLink.click()
        const startNowWelshPageTitle = await browser.getTitle()
        await expect(startNowWelshPageTitle).toMatch(
          'Gwirio ansawdd aer - GOV.UK'
        )
        // back to english
        await startNowPage.toEnglishTranslationLink.click()
        await startNowPage.startNowBtnClick()

        // Location search page
        const LocationHeaderText = 'Where do you want to check?'
        const getLocationSearchHeaderText =
          await locationSearchPage.getLocationSearchHeader.getText()
        await expect(getLocationSearchHeaderText).toMatch(LocationHeaderText)
        const locSearchPageTitle = await browser.getTitle()
        await expect(locSearchPageTitle).toMatch(
          'Where do you want to check? - Check air quality - GOV.UK'
        )

        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const locSearchWelshPageTitle = await browser.getTitle()
        await expect(locSearchWelshPageTitle).toMatch(
          'Ble hoffech chi wirio? - Gwirio ansawdd aer - GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()

        // Error Validation
        await locationSearchPage.clickContinueBtn()
        const locSearchErrPageTitle = await browser.getTitle()
        await expect(locSearchErrPageTitle).toMatch(
          'Error: Where do you want to check? - Check air quality - GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        await locationSearchPage.clickContinueBtn()
        const locSearchErrWelshPageTitle = await browser.getTitle()
        await expect(locSearchErrWelshPageTitle).toMatch(
          'Gwall: Ble hoffech chi wirio? - Gwirio ansawdd aer - GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()

        if (NI === 'No') {
          await locationSearchPage.clickESWRadiobtn()
          await locationSearchPage.setUserESWRegion(region)
        } else if (NI === 'Yes') {
          await locationSearchPage.clickNIRadiobtn()
          await locationSearchPage.setUserNIRegion(region)
        }

        await locationSearchPage.clickContinueBtn()
        if (await LocationMatchPage.headerTextMatch.isExisting()) {
          const locMatchPageTitle = await browser.getTitle()
          await expect(locMatchPageTitle).toMatch(
            'Locations matching ' + region + ' - Check air quality - GOV.UK'
          )
          // Click Welsh Toogle button
          await locationSearchPage.linkButtonWelsh.click()
          const locMatchWelshPageTitle = await browser.getTitle()
          await expect(locMatchWelshPageTitle).toMatch(
            'Lleoliadau yn cyfateb ' + region + ' - Gwirio ansawdd aer - GOV.UK'
          )
          // Click English Toogle button
          await locationSearchPage.linkButtonEnglish.click()
          await LocationMatchPage.firstLinkOfLocationMatch.click()
        }
        // Main Forecast page
        const getUserRegion =
          await ForecastMainPage.regionHeaderDisplay.getText()
        const mainPageTitle = await browser.getTitle()
        await expect(mainPageTitle).toMatch(
          getUserRegion + ' - Check air quality - GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const getUserRegionWelsh =
          await ForecastMainPage.regionHeaderDisplay.getText()
        const mainPageWelshPageTitle = await browser.getTitle()
        await expect(mainPageWelshPageTitle).toMatch(
          getUserRegionWelsh + ' - Gwirio ansawdd aer - GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()

        // Gases pollutants link - Ozone
        await ForecastMainPage.pollutantsLinkOzone.scrollIntoView()
        await ForecastMainPage.pollutantsLinkOzone.click()
        const o3Header = await o3StaticPage.o3HeaderDisplay.getText()
        await expect(o3Header).toMatch('Ozone (O₃)')
        const ozonePageTitle = await browser.getTitle()
        await expect(ozonePageTitle).toMatch(
          'Ozone(O₃) – Check air quality – GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const ozoneWelshPageTitle = await browser.getTitle()
        await expect(ozoneWelshPageTitle).toMatch(
          'Osôn(O₃) – Gwirio ansawdd aer – GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.back()
        await browser.back()
        await browser.back()

        // Gases pollutants link - NO2
        await ForecastMainPage.pollutantsLinkNO2.scrollIntoView()
        await ForecastMainPage.pollutantsLinkNO2.click()
        const no2Header = await no2StaticPage.no2HeaderDisplay.getText()
        await expect(no2Header).toMatch('Nitrogen dioxide (NO₂)')
        const no2PageTitle = await browser.getTitle()
        await expect(no2PageTitle).toMatch(
          'Nitrogen dioxide (NO₂) – Check air quality – GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const no2WelshPageTitle = await browser.getTitle()
        await expect(no2WelshPageTitle).toMatch(
          'Nitrogen deuocsid (NO₂) – Gwirio ansawdd aer – GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.back()
        await browser.back()
        await browser.back()

        // Gases pollutants link - SO2
        await ForecastMainPage.pollutantsLinkSO2.scrollIntoView()
        await ForecastMainPage.pollutantsLinkSO2.click()
        const so2Header = await so2StaticPage.so2HeaderDisplay.getText()
        await expect(so2Header).toMatch('Sulphur dioxide (SO₂)')
        const so2PageTitle = await browser.getTitle()
        await expect(so2PageTitle).toMatch(
          'Sulphur dioxide (SO₂) – Check air quality – GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const so2WelshPageTitle = await browser.getTitle()
        await expect(so2WelshPageTitle).toMatch(
          'Sylffwr deuocsid (SO₂) – Gwirio ansawdd aer – GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.back()
        await browser.back()
        await browser.back()

        // Gases pollutants link - PM25
        await ForecastMainPage.pollutantsLinkPM25.scrollIntoView()
        await ForecastMainPage.pollutantsLinkPM25.click()
        const pm25Header = await pm25StaticPage.pm25HeaderDisplay.getText()
        await expect(pm25Header).toMatch('Particulate matter (PM2.5)')
        const pm25PageTitle = await browser.getTitle()
        await expect(pm25PageTitle).toMatch(
          'Particulate matter (PM2.5) – Check air quality – GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const pm25WelshPageTitle = await browser.getTitle()
        await expect(pm25WelshPageTitle).toMatch(
          'Mater gronynnol (PM2.5) – Gwirio ansawdd aer – GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.back()
        await browser.back()
        await browser.back()

        // Gases pollutants link - PM10
        await ForecastMainPage.pollutantsLinkPM10.scrollIntoView()
        await ForecastMainPage.pollutantsLinkPM10.click()
        const pm10Header = await pm10StaticPage.pm10HeaderDisplay.getText()
        await expect(pm10Header).toMatch('Particulate matter (PM10)')
        const pm10PageTitle = await browser.getTitle()
        await expect(pm10PageTitle).toMatch(
          'Particulate matter (PM10) – Check air quality – GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const pm10WelshPageTitle = await browser.getTitle()
        await expect(pm10WelshPageTitle).toMatch(
          'Mater gronynnol (PM10) – Gwirio ansawdd aer – GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.back()
        await browser.back()
        await browser.back()

        // Footer privacy
        await footerObjects.privacyFooterLink.scrollIntoView()
        await footerObjects.privacyFooterLink.click()
        const privacyPageTitle = await browser.getTitle()
        await expect(privacyPageTitle).toMatch(
          'Privacy - Check air quality - GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const privacyWelshPageTitle = await browser.getTitle()
        await expect(privacyWelshPageTitle).toMatch(
          'Preifatrwydd - Gwirio ansawdd aer - GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.back()
        await browser.back()
        await browser.back()

        // Footer - cookies
        await footerObjects.cookieFooterLink.scrollIntoView()
        await footerObjects.cookieFooterLink.click()
        const cookiesPageTitle = await browser.getTitle()
        await expect(cookiesPageTitle).toMatch(
          'Cookies - Check air quality - GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const cookiesWelshPageTitle = await browser.getTitle()
        await expect(cookiesWelshPageTitle).toMatch(
          'Cwcis - Gwirio ansawdd aer - GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.back()
        await browser.back()
        await browser.back()

        // Footer - Accessibility Statement
        await footerObjects.AccStmtFooterLink.scrollIntoView()
        await footerObjects.AccStmtFooterLink.click()
        const accStmtPageTitle = await browser.getTitle()
        await expect(accStmtPageTitle).toMatch(
          'Accessibility Statement - Check air quality - GOV.UK'
        )
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        const accStmtWelshPageTitle = await browser.getTitle()
        await expect(accStmtWelshPageTitle).toMatch(
          'Datganiad Hygyrchedd - Gwirio ansawdd aer - GOV.UK'
        )
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.back()
        await browser.back()
        await browser.back()
      })
    }
  )
})
