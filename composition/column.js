module.exports = {

  add_data_for_remarks: async function() {
    const searchKeys = ['Shirt', 'Hoodie', 'Sweater', 'Blanket']
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

  add_data_for_email: async function() {
    for (let count = 0; count <= this.rowData.appendTimes; count++) {
      const emails = this.rowData.getEmails()
      const email = emails[count]
      const isEmail = email.removeQuoations().isEmail()

      if (count === 0) {
        if (!isEmail) this.rowData.pushData('')
        else this.rowData.pushData(`"${email}"`)
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