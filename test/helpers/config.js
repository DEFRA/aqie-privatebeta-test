/* eslint-disable prettier/prettier */
import convict from 'convict'
import path from 'path'

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
    env: 'CDP_HTTP_PROXY'
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
    default: 'e3BakXA1Up8PxN3ehAYO',
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
    doc: 'URL to the forecast data service',
    format: String,
    default: 'https://uk-air.defra.gov.uk/assets/rss/forecast.xml',
    env: 'FORECAST_URL'
  },
  measurementsApiUrl: {
    doc: 'Ricardo API url',
    format: String,
    default: `https://aqie-back-end.${process.env.ENVIRONMENT}.cdp-int.defra.cloud/measurements`,
    env: 'MEASUREMENTS_API_URL'
  }
})

config.validate({ allowed: 'strict' })

module.exports = config
