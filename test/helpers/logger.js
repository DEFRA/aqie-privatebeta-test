import pino from 'pino'

import loggerOptions from 'helpers/logger-options'

function createLogger() {
  return pino(loggerOptions)
}

module.exports = createLogger
