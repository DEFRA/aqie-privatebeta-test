import ecsFormat from '@elastic/ecs-pino-format'
import config from 'helpers/config'

const loggerOptions = {
  level: config.get('logLevel'),
  ...(config.get('isTest')
    ? { transport: { target: 'pino-pretty' } }
    : ecsFormat())
}

module.exports = loggerOptions
