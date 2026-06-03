/* eslint-disable prettier/prettier */
import convict from 'convict'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.normalize(path.join(__dirname, '..', '..'))
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'production'
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'test'
  },
  logLevel: {
    doc: 'Logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  httpsProxy: {
    doc: 'HTTPS Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTPS_PROXY'
  },
  daqiePassword: {
    doc: 'password for daqie',
    format: '*',
    default: 'whatisintheair',
    sensitive: true,
    env: 'DAQIE_PASSWORD'
  },
  forecastSummaryUrl: {
    doc: 'Summary forecast url',
    format: String,
    default: 'https://uk-air.defra.gov.uk/ajax/forecast_text_summary.php',
    env: 'FORECAST_SUMMARY_URL'
  },
  forecastUrl: {
    doc: 'URL to the forecast data service (primary)',
    format: String,
    default: `https://aqie-forecast-api.${process.env.ENVIRONMENT}.cdp-int.defra.cloud/forecast`,
    env: 'FORECAST_URL'
  },
  ephemeralForecastUrl: {
    doc: 'Ephemeral protected URL to the forecast data service (fallback)',
    format: String,
    default: `https://ephemeral-protected.api.test.cdp-int.defra.cloud/aqie-forecast-api/forecast`,
    env: 'EPHEMERAL_FORECAST_URL'
  },
  ephemeralApiKey: {
    doc: 'API key for ephemeral forecast service',
    format: String,
    default: 'O6o62H5Ss87HXnfUfyI73Lo3VbTUfiDF',
    sensitive: true,
    env: 'EPHEMERAL_API_KEY'
  },
  newRicardoSiteMetaData: {
    doc: 'Ricardo API url',
    format: String,
    default: `https://api-ukair.defra.gov.uk/api/site_meta_datas`,
    env: 'NEW_RICARDO_SITE_META_DATA'
  },
  pollutantsMeasurementsUrl: {
    doc: 'Pollutants measurements API url',
    format: String,
    default: `https://api-ukair.defra.gov.uk/api/pollutant_measurement_datas`,
    env: 'POLLUTANTS_MEASUREMENTS_URL'
  },
  newRicardoApiPwd: {
    doc: 'New Ricardo API password',
    format: String,
    default: `f$jXx$$rBe34yg`,
    env: 'NEW_RICARDO_API_PWD'
  },
  newRicardoApiEmail: {
    doc: 'New Ricardo API email',
    format: String,
    default: `TQxYFXbx`,
    env: 'NEW_RICARDO_API_EMAIL'
  },
  siteMetaDataLoginUrl: {
    doc: 'Site Meta Data Login URL',
    format: String,
    default: `https://api-ukair.defra.gov.uk/api/login_check`,
    env: 'SITE_META_DATA_LOGIN_URL'
  },
  aqsrAlertsUrl: {
    doc: 'AQSR air pollution breaches/alerts API url',
    format: String,
    default: `https://api-ukair.defra.gov.uk/api/aqsr_alerts`,
    env: 'AQSR_ALERTS_URL'
  },
  aqsrAlertsApiEmail: {
    doc: 'AQSR alerts API email',
    format: String,
    default: `gbMpftHz`,
    env: 'AQSR_ALERTS_API_EMAIL'
  },
  aqsrAlertsApiPwd: {
    doc: 'AQSR alerts API password',
    format: '*',
    default: `9m4Y$YmtsooGs9`,
    sensitive: true,
    env: 'AQSR_ALERTS_API_PWD'
  },
  alertMobileNumber: {
    doc: 'Mobile number used for the SMS alert sign-up journey tests',
    format: '*',
    default: `07459418445`,
    sensitive: true,
    env: 'ALERT_MOBILE_NUMBER'
  },
  alertEmailAddress: {
    doc: 'Email address used for the email alert sign-up journey tests',
    format: '*',
    default: `airqualityukdefra@gmail.com`,
    sensitive: true,
    env: 'ALERT_EMAIL_ADDRESS'
  }
})

config.validate({ allowed: 'strict' })

export default config
