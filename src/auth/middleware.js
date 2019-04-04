'use strict';
/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjYTU2MzcyZmNmZDA5YjFkOTM3YTE5NCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTU0MzQzMDU3fQ.v3Rb-EK3m2hY5ftJ-o0jOGdWOnNj0bww2EkuOATng0I
*/

const User = require('./users-model.js');

module.exports = (req, res, next) => {
  
  try {
    let [authType, authString] = req.headers.authorization.split(/\s+/);
    
    switch( authType.toLowerCase() ) {
      case 'basic': 
        return _authBasic(authString);
      case 'bearer':
        return _authBearer(authString);
      default: 
        return _authError();
    }
  }
  catch(e) {
    next(e);
  }
  
  
  function _authBasic(str) {
    // str: am9objpqb2hubnk=
    let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
    let bufferString = base64Buffer.toString();    // john:mysecret
    let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
    let auth = {username,password}; // { username:'john', password:'mysecret' }
    
    return User.authenticateBasic(auth)
      .then(user => _authenticate(user) )
      .catch(next);
  }
  /**
   * @function _authBearer
   * Called to authenticate a sign-in with a Bearer Header. Takes a user token and runs User bearer authentication method to verify the token.
   * @param  {string} str a string of the user's token
   */
  function _authBearer(str) {
    return User.authenticateBearer(str)
      .then(user => _authenticate(user))
      .catch(next);
  }

  function _authenticate(user) {
    if(user) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }
  
  function _authError() {
    next('Invalid User ID/Password');
  }
  
};