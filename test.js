#!./node_modules/mocha/bin/_mocha 

const { expect, request } = require('chai');
const validateEmail = require("./index.js");
const Promise = require("bluebird");

describe('Live Integration Tests', () => {
  describe('Valid Emails', 
    () => [
      "smokejumperit@gmail.com",
      "smokejumperit+1@gmail.com",
      "smokejumperit+oct1@gmail.com",
      "smokejumperit+oct.1@gmail.com",
      "robert@getbeewell.com",
      "robert@beewell.health",
      "robert+1@beewell.health",
      "robert+oct1@beewell.health",
      "robert+oct.1@beewell.health",
    ].forEach(
      (email) => it(
        "should return valid for " + email, 
        () => validateEmail(email).then((result) => expect(result).to.be.true)
      )
    )
  );
  describe('Invalid Emails', 
    () => [
      'root',
      'smokejumperit@.com',
      null,
      undefined,
      1,
      '@gmail.com',
      'smokejumperit@',
      'smokejumperit@gmail.',
      ' @ ',
      ' @ .com',
      ' @gmail.com',
      'smokejumperit@totally.invalid.tld.asdfjadfkajsflksjfdakldjsfaslksj',
      'smokejumperit@slippery.email',
      'smokejumperit@maildrop.cc',
    ].forEach(
      (email) => it(
        "should return INvalid for " + email,
        () => validateEmail(email).then((result) => expect(result).to.not.be.ok)
      )
    )
  );
});

