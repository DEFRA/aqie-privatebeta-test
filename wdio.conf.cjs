import fs from 'node:fs'
import path from 'node:path'

const debug = process.env.DEBUG
const oneHour = 60 * 60 * 1000

// Helper: get all spec files and split into web/mobile
const specDir = path.resolve('./test/specs')
const allSpecs = fs.readdirSync(specDir)
const mobileSpecs = allSpecs.filter(f => f.startsWith('mobile') && f.endsWith('.js')).map(f => `./test/specs/${f}`)
const webSpecs = allSpecs.filter(f => !f.startsWith('mobile') && f.endsWith('.js')).map(f => `./test/specs/${f}`)

// Helper: print environment logs
function logEnv(env) {
  // eslint-disable-next-line no-console
  console.log(`\n=== Running ${env} tests ===\n`)
}

// Dynamic config builder
function getConfigForSpecs(specs) {
  if (specs.length === 0) return null
  if (specs[0].includes('mobile')) {
    logEnv('Mobile (BrowserStack)')
    // eslint-disable-next-line no-console
    console.log(`Mobile specs count: ${specs.length}`)
    return {
      specs,
      maxInstances: 1,
      capabilities: [
        {
          'bstack:options': {
            userName: process.env.BROWSERSTACK_USER,
            accessKey: process.env.BROWSERSTACK_KEY,
            projectName: 'aqie-privatebeta-test',
            buildName: `test-run-${process.env.ENVIRONMENT}`,
            local: true,
            localIdentifier: 'wdio-local',
            debug: true
          },
          acceptInsecureCerts: true,
          browserName: 'chrome',
          os: 'Android',
          osVersion: '11.0',
          deviceName: 'Samsung Galaxy S21',
        }
      ],
      services: [
        [
          'browserstack',
          {
            testObservability: true,
            testObservabilityOptions: {
              user: process.env.BROWSERSTACK_USER,
              key: process.env.BROWSERSTACK_KEY,
              projectName: 'aqie-privatebeta-test',
              buildName: `test-run-${process.env.ENVIRONMENT}`
            },
            acceptInsecureCerts: true,
            forceLocal: false,
            browserstackLocal: true,
            opts: {
              proxyHost: 'localhost',
              proxyPort: 3128
            }
          }
        ]
      ]
    }
  } else {
    logEnv('Web (Local Chrome)')
    // eslint-disable-next-line no-console
    console.log(`Web specs count: ${specs.length}`)
    return {
      specs,
      maxInstances: 1,
      capabilities: [
        {
          maxInstances: 1,
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              '--no-sandbox',
              '--disable-infobars',
              '--headless',
              '--disable-gpu',
              '--window-size=1920,1080',
              '--enable-features=NetworkService,NetworkServiceInProcess',
              '--password-store=basic',
              '--use-mock-keychain',
              '--dns-prefetch-disable',
              '--disable-background-networking',
              '--disable-remote-fonts',
              '--ignore-certificate-errors',
              '--host-resolver-rules=MAP www.googletagmanager.com 127.0.0.1'
            ]
          }
        }
      ],
      services: []
    }
  }
}

// Build config: run web specs first, then mobile specs
const webConfig = getConfigForSpecs(webSpecs)
const mobileConfig = getConfigForSpecs(mobileSpecs)

// Merge base config
export const config = {
  runner: 'local',
  baseUrl: `https://aqie-front-end.${process.env.ENVIRONMENT}.cdp-int.defra.cloud/`,
  hostname: process.env.CHROMEDRIVER_URL || '127.0.0.1',
  port: process.env.CHROMEDRIVER_PORT || 4444,
  execArgv: debug ? ['--inspect'] : [],
  logLevel: debug ? 'debug' : 'info',
  logLevels: { webdriver: 'error' },
  bail: 0,
  waitforTimeout: 10000,
  waitforInterval: 200,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: [
    [
      'spec',
      { addConsoleLogs: true, realtimeReporting: true, color: false }
    ],
    [
      'allure',
      { outputDir: 'allure-results' }
    ]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: debug ? oneHour : 90000
  },
  beforeTest: function (test) {
    // eslint-disable-next-line no-console
    console.log(`Starting: ${test.title}`)
  },
  afterTest: async function (
    test,
    context,
    { error, result, duration, passed, retries }
  ) {
    // eslint-disable-next-line no-console
    console.log(`Finished: ${test.title} - ${passed ? 'PASSED' : 'FAILED'} (${duration}ms)`)
    await browser.takeScreenshot()
  },
  onComplete: function (exitCode, config, capabilities, results) {
    // eslint-disable-next-line no-console
    console.log(`Test run completed - Passed: ${results.passed || 0}, Failed: ${results.failed || 0}`)
    if (results?.failed && results.failed > 0) {
      // eslint-disable-next-line no-console
      console.log('Writing failure report to ./FAILED')
      fs.writeFileSync('./FAILED', JSON.stringify(results))
    }
  }
}

// Sequentially run web then mobile specs
if (webConfig) {
  // eslint-disable-next-line no-console
  console.log('Applying web configuration')
  Object.assign(config, webConfig)
  // After web tests, run mobile if present
  if (mobileConfig) {
    // eslint-disable-next-line no-console
    console.log('Mobile configuration will follow web tests')
    // This is a simplified approach; for true sequential runs, use a runner script or wdio multi-remote
    setTimeout(() => {
      Object.assign(config, mobileConfig)
    }, 0)
  }
} else if (mobileConfig) {
  // eslint-disable-next-line no-console
  console.log('Applying mobile configuration (no web specs found)')
  Object.assign(config, mobileConfig)
}