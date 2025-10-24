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
    env: 'CDP_HTTPS_PROXY'
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
    default: 'https://aqie-forecast-api.dev.cdp-int.defra.cloud/forecast',
    env: 'FORECAST_SUMMARY_URL'
  },
  forecastUrl: {
    doc: 'URL to the forecast data service',
    format: String,
    default: `https://aqie-forecast-api.dev.cdp-int.defra.cloud/forecast`,
    env: 'FORECAST_URL'
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
  }
})

config.validate({ allowed: 'strict' })

export default config
