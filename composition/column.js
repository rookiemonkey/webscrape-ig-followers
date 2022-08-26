const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {

  add_data_for_remarks: async function() {
    const searchKeys = ['Shirt', 'Hoodie', 'Sweater', 'Blanket', 'Vest']
    let remarks = process.env.default_remarks

    for (let searchKey of searchKeys) {
      if (!this.rowData.getCategories().includes(searchKey)) continue;
      remarks === process.env.default_remarks ? remarks = '' : null;
      remarks += `${searchKey} `
    }

    this.rowData.pushData(`"${remarks}"`)
  },

  add_data_for_ig_followers: async function() {
    const igUrl = this.rowData.getIgUrl();
    let igFollowers = process.env.default_ig_followers

    if (igUrl) {
      igFollowers = await this.windows.evaluateIgUrl(igUrl, false);
      
      if (!igFollowers) igFollowers = process.env.max_retries_error;
      this.state.incrementKeyOfActiveBrowser();
      this.state.incrementNumOfIgRequests();
    }

    this.rowData.pushData(`"${igFollowers}"`)
  },

  add_data_for_ig_followers_v2: async function () {
    const igUrl = this.rowData.getIgUrl();
    let igFollowers = process.env.default_ig_followers

    if (igUrl) {
      igFollowers = "NOT FOUND"

      const username = this.igClient.getUserName(igUrl);
      const results = await this.igClient.search.users(username)

      if (results.length > 0) {
        const userInsight = await this.igClient.insight.account({ userId: results[0].pk })
        igFollowers = userInsight.data.user.followers_count
      }

      this.state.incrementNumOfIgRequests();
    }

    this.rowData.pushData(`"${igFollowers}"`)
  },

  add_data_for_ig_followers_v3: async function() {
    try {
      const igUrl = this.rowData.getIgUrl();
      let igFollowers = process.env.default_ig_followers

      if (igUrl) {
        igFollowers = "NOT FOUND"

        const username = this.igClient.getUserName(igUrl);
        const raw = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`)
        const response = await raw.json()

        if (response && response.graphql && response.graphql.user && response.graphql.user.edge_followed_by) {
          igFollowers = response.graphql.user.edge_followed_by.count
          this.windows.logFile.log(`[GET] ${username} #of FOLLOWERS - ${igFollowers}`)
        }

        this.state.incrementNumOfIgRequests();
        await this.state.sleep(process.env.delay);
      }

      this.rowData.pushData(`"${igFollowers}"`)
    }
    catch(e) {
      const igUrl = this.rowData.getIgUrl();
      const username = this.igClient.getUserName(igUrl);
      this.windows.logFile.log(`[ERROR] Parsing JSON data for ${username}`)
      this.rowData.pushData(`"HAS IG URL - BUT JSON PARSING ERROR"`)
    }
  },

  add_data_for_email: async function() {
    for (let count = 0; count <= this.rowData.appendTimes; count++) {
      const emails = this.rowData.getEmails()
      const email = emails[count]
      if (!email) continue;

      if (count === 0) {
        this.rowData.pushData(`"${email}"`)
      }

      if (count > 0) {
        const newRow = [...this.rowData.mainData()]
        newRow[await this.getColumnIndex()] = `"${email}"`
        this.rowData.pushRow(newRow)
      }
    }
  },

  add_data_for_primary_email: async function() {
    const emails = this.rowData.getEmails()

    const keywords = ['info', 'admin', 'contact', 'business', 'collab', 'contact']
    const filteredEmails = emails.filter(email => keywords.some(keyword => keyword === email.toLowerCase().slice(0, email.indexOf('@'))))

    let randomEmail = ''

    if (emails.length > 0) randomEmail = emails[Math.floor(Math.random() * emails.length)]

    if (filteredEmails.length > 0) randomEmail = filteredEmails[Math.floor(Math.random() * filteredEmails.length)]

    this.rowData.pushData(`"${randomEmail}"`)
  }

}