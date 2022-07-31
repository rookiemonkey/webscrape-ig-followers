module.exports = {
  getName: function () { return this.mainData()[0].removeQuoations() },
  getWebsiteUrl: function() { return this.mainData()[1].removeQuoations() },
  getCategories: function () { return this.mainData()[6] },
  getIgUrl: function () { return this.mainData()[7].removeQuoations() },
  getFacebookUrl: function () { return this.mainData()[8].removeQuoations() },
  getTwitterUrl: function () { return this.mainData()[9].removeQuoations() },
  getYoutubeUrl: function () { return this.mainData()[10].removeQuoations() },
  getLinkedInUrl: function () { return this.mainData()[11].removeQuoations() },
  getPinterestUrl: function () { return this.mainData()[12].removeQuoations() },
  getTikTokUrl: function () { return this.mainData()[13].removeQuoations() },
  getEmails: function () { return this.mainData()[14].removeQuoations().split(' ') }
}