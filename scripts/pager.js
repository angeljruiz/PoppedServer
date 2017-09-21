class Pager {
  constructor() {
    this.loggedIn = false;
    this.owner = false;
  }

  update(req) {
    this.path = 'angel.ddns.net' + req.path;
    if (req.isAuthenticated())
      this.loggedIn = true;
    else
      this.loggedIn = false;
    if (typeof req.user !== 'undefined') {
      this.user = req.user;
      if (req.query.id === req.user.localId)
        this.owner = true;
      else
        this.owner = false;
    } else {
      this.user = 0;
    }
    if (req.path === '/')
      this.owner = true;
  }
}

module.exports = new Pager;
