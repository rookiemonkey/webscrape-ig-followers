const { IgApiClient } = require('instagram-private-api');
const { SearchService } = require('instagram-private-api/dist/services/search.service');
const { InsightsService } = require('instagram-private-api/dist/services/insights.service');

class IgClient {
  constructor() {
    this.ig = new IgApiClient()
    this.search = new SearchService(this.ig)
    this.insight = new InsightsService(this.ig)
  }

  async initialize() {
    if (!process.env.initialize_ig_client.toBoolean()) return null

    const dummyUsername = process.env.ig_username
    const dummyPassword = process.env.ig_password

    this.ig.state.generateDevice(dummyUsername);
    
    await this.ig.simulate.preLoginFlow();
    await this.ig.account.login(dummyUsername, dummyPassword);
  }

  getUserName(igUrl) {
    return igUrl.slice(igUrl.indexOf('.com/') + 5).split('/')[0]
  }
}

module.exports = IgClient;