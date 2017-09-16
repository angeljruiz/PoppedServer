module.exports = {
  isLoggedOn: (req, res, next) => {
    if(req.isAuthenticated()) {
      if (req.path === '/user' && req.query.id === req.user.localId)
        return res.redirect('/');
      return next();
    }
    res.flash('notLogged', 'Please sign in')
    res.redirect('/login');
  },

  validateInfo: (req, res, next) => {
    if (req.body.username === '' || req.body.password === '' || req.body.email === '') {
      req.res.flash('incorrect', 'Invalid username, email, or password');
      if (req.originalUrl === '/login')
        return res.redirect('/login');
      else
        return res.redirect('/signup');
    }
    return next();
  }
}
