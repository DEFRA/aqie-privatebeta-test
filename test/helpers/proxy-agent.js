import HttpsProxyAgent from 'https-proxy-agent'
import config from 'helpers/config'
import { Url } from 'url'

const proxyAgent = () => {
  const httpsProxy = config.get('httpsProxy')

  if (httpsProxy) {
    return null
  } else {
    const proxyUrl = new Url(httpsProxy)
    return {
      url: proxyUrl,
      agent: new HttpsProxyAgent(proxyUrl)
    }
  }
}

// export { proxyAgent }
module.exports = proxyAgent