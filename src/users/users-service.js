const bcrypt = require('bcryptjs');
const xss = require('xss');

const r = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&])[\S]+/;

const UsersService = {
  findUser(db, user_name) {
    return db('thingful_users')
      .where({user_name})
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('thingful_users')
      .returning('*')
      .then(([user]) => user)
    ;
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }   
    
    if (password.startsWith(' ') || password.endsWith(' ')) {
     return 'Password must not start or end with empty spaces';
   }
   if (!r.test(password)) {
      return 'Password must have 1 upper case, lower case, number and special character';
    }

    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  serializeUser(user) {
    return {
      id: user.id,
      full_name: xss(user.full_name),
      user_name: xss(user.user_name),
      nickname: xss(user.nick_name),
      date_created: new Date(user.date_created),
    }
  }
}

module.exports = UsersService;