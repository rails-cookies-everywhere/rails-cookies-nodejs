const crypto = require('crypto');
const qs = require('querystring');

const SECRET_KEY_BASE = process.env.SECRET_KEY_BASE || '';
const SECRET_KEY_SALT = process.env.SECRET_KEY_SALT || 'authenticated encrypted cookie';
const SECRET_KEY_ITER = 1000;
const SECRET_KEY_LEN = 32;
const SECRET_KEY = crypto.pbkdf2Sync(
  SECRET_KEY_BASE,
  SECRET_KEY_SALT,
  SECRET_KEY_ITER,
  SECRET_KEY_LEN,
  'sha1'
).slice(0, 32)

const decipherAes = (payload, iv, authTag) => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', SECRET_KEY, iv);

  decipher.setAuthTag(authTag);
  let result = decipher.update(payload, 'base64', 'utf8');
  result += decipher.final('utf8')

  return result;
};

const decipherCookies = (cookie) => {
  const cookie_parts = cookie.split('--');
  if (cookie_parts.length != 3)
    return null

  // let payload, iv, authTag;
  let [payload, iv, authTag] = cookie_parts.map(function (str) {
    return Buffer.from(str, 'base64')
  })
  if ([payload, iv, authTag].map(function (str) { return str.length }).indexOf(0) != -1)
    return null

  const decipheredCookie = decipherAes(payload, iv, authTag)

  return JSON.parse(decipheredCookie)
}

const decipherSessionData = (cookie) => {
  const session_data = Buffer.from(cookie['_rails']['message'], 'base64');
  return JSON.parse(session_data.toString('utf8'))
}

const decipherRailCookies = (req, res, next) => {
  const cookie = qs.unescape(req.cookies[process.env.SESSION_COOKIE_NAME])
  if (!cookie) {
    return next();
  }

  const decipheredCookie = decipherCookies(cookie)
  if (!decipheredCookie)
    return next()

  const expirationDate = decipheredCookie['exp']
  if (expirationDate && new Date(Date.parse(expirationDate)) > new Date())
    return next();

  if (!decipheredCookie['_rails'] || !decipheredCookie['_rails']['message'])
    return next();


  req.rails_session = decipherSessionData(decipheredCookie)
  return next();
}

const bakeCookie = (jsonData) => {
  const messageBuffer = Buffer.from(JSON.stringify(jsonData), 'utf-8').toString('base64')
  const message = JSON.stringify({ _rails: { message: messageBuffer } })

  const iv = Buffer.from(crypto.randomBytes(12), 'base64')
  const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv)
  let enc = cipher.update(message, 'utf8', 'base64')
  enc += cipher.final('base64')

  const authTag = cipher.getAuthTag()
  // Hint: if (decipherAes(enc, iv, authTag) != message) {

  return [enc.toString('base64'), iv.toString('base64'), authTag.toString('base64')].join('--')
}

module.exports = {
  decipherRailCookies: decipherRailCookies,
  decipherSessionData: decipherSessionData,
  decipherCookies: decipherCookies,
  decipherAes: decipherAes,
  bakeCookie: bakeCookie
}