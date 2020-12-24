const bcrypt = require('bcryptjs');
const AuthService = require('./../auth/auth-service');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';


  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing basic token' })
  } else {
    basToken = authToken.slice('bearer '.length)
  }

  const [tkUserName, tkPassword] = AuthService.parseBasicToken(basToken);

  if (!tkUserName || !tkPassword) {
    return res.status(401).json({ error: 'Unauthorized Request' })
  }

  AuthService.getUser(
    req.app.get('db'), 
    tkUserName)
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized Request' });
        }
        console.log(tkPassword.length, user.password.length);
        return bcrypt.compare(tkPassword, user.password)
          .then(matching => {
            console.log(matching);
            if (!matching) {
              return res.status(401).json({ error: 'Unauthorized Request x' });
            }

            req.user = user;

            next();
          });
      })
      .catch(next)
}

module.exports = {
  requireAuth,
}