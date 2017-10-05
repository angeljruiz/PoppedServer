class Pager {
  constructor() {
    this.loggedIn = false;
    this.owner = false;
  }

  update(req) {
    this.path = 'clickwithit.us' + req.path;
    if (req.isAuthenticated())
      this.loggedIn = true;
    else
      this.loggedIn = false;
    if (typeof req.user !== 'undefined') {
      if (req.user.localUsername === 'angel')
        this.aauth = true;
      if (req.query.id === req.user.localId)
        this.owner = true;
      else
        this.owner = false;
    } else {
      this.user = 0;
    }
    if (req.path === '/')
      this.owner = true;
    for (let prop in this)
      req.res.locals[prop] = this[prop];
  }
}

module.exports = new Pager;
