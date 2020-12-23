const authService = {
  getUser(database, user_name) {
    return database('thingful_users')
      .where({user_name})
      .first()
    ;
  },
  parseBasicToken(token) {
    console.log('PARSING THIS TOKEN', token.length)

    return Buffer
      .from(token, 'base64')
      .toString()
      .split(':')
    ;
  },
}

module.exports = authService;