const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonBP = express.json();

authRouter
  .post('/', jsonBP, (req, res, next) => {
    const { user_name, password } = req.body;
    const loginUser = { user_name, password };
    console.log('loginUser', loginUser);

    for (const [k, v] of Object.entries(loginUser))
      if (v == null)
        return res.status(400).json({
          error: `Missing '${k}' in request body`
        })

    AuthService.getUser(
      req.app.get('db'),
      loginUser.user_name
    )
      .then(dbUser => {
        if (!dbUser) {
          return res.status(400).json({
            error: 'Incorrect user_name or password',
          })
        }

        return AuthService.comparePasswords(loginUser.password, dbUser.password)
        .then(compareMatch => {
          if (!compareMatch) {
            return res.status(400).json({
              error: 'Incorrect user_name or password',
            })
          }

          const sub = dbUser.user_name
          const payload = { user_id: dbUser.id }
          res.send({
            authToken: AuthService.createJwt(sub, payload),
          })
        })
      })
    .catch(next)
  })

module.exports = authRouter