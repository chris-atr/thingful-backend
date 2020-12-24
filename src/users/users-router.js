const express = require('express')
const path = require('path')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonBP = express.json()

usersRouter
  .post('/', jsonBP, (req, res, next) => {
    const { password, user_name, full_name, nickname } = req.body;

    for (const area of ['full_name', 'user_name', 'password'])
      if (!req.body[area])
        return res.status(400).json({
          error: `Missing '${area}' in request body`
        })

    const passwordError = UsersService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.findUser(
      req.app.get('db'),
      user_name
    )
      .then(foundUser => {
        if (foundUser)
          return res.status(400).json({ error: `Username already taken` })

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              user_name,
              password: hashedPassword,
              full_name,
              nickname,
              date_created: 'now()',
            }

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                return res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(UsersService.serializeUser(user))
              })
          })
      })
      .catch(next)
  })

module.exports = usersRouter