// Don't worry, it's on localhost ;)
process.env.SECRET_KEY_BASE = '10b8683351f3a680391ba9b4735285900b6a7745ed5791437f001a938cc4dfac997363195051a28be31ba64d7a0098c2efc41aed4ef206fb18f373339a44bd2f'
process.env.SESSION_COOKIE_NAME = '_roze_api_session'

const sample_cookie = 'FaxbWcVc2y/48LYms/BrNb5r2MUXZcfZLpfzYOR0lVoQvoKz5R3IQwoNVL3VXgcudYp4oWYCuxX4IID70mjmFBcDK5DQTvykD1JAKgcFsbQcxDR5E/PBKTBwS5L5pEruWIB72Lu9o6BXreK6VZeNrAp9xBASiz+a/X33XAMrZFPPC/TGotfkkeLjwTx24wVg5OoET/Y3DkDhlXd9H0sho6lUEJLxxLyhNB+zqCc3i/sB2nyqRXf7J/3FsALeiwrPSCjF8ivBFyeD4pRercRBTNbLP6+Z--7FdUaoy4iwX6C+GX--2bq4Qvv1UDTUHv+O4pRxBg=="';
const sample_message = 'eyJzZXNzaW9uX2lkIjoiMDMzZmY0MTBiYjY4MTcyMGJmZDRkMDM5NjIxMTFiMzkiLCJjdXJyZW50X3VzZXJfdXVpZCI6Ijk1ZDczYmY4LTZlZGYtNGE2Ny1iMWY5LTIyNzM5OGJkZDhhZiJ9';

const expect = require('chai').expect

const decipherCookies = require('../index.js').decipherCookies
const decipherSessionData = require('../index.js').decipherSessionData

describe('#decipherCookies()', function () {
  context('with string of invalid parts', function () {
    it('returns null', function () {
      expect(decipherCookies('--foo--bar--')).to.be.null
      expect(decipherCookies('foo--bar')).to.be.null
      expect(decipherCookies('foo')).to.be.null
      expect(decipherCookies('')).to.be.null
    })
  })

  context('with string of empty length', function () {
    it('returns null', function () {
      expect(decipherCookies('foo--bar--')).to.be.null
      expect(decipherCookies('foo----bar')).to.be.null
      expect(decipherCookies('--foo--bar')).to.be.null
    })
  })

  context('with the correct data', function () {
    it('returns the Rails cookie', function () {
      const session_data = decipherCookies(sample_cookie);
      expect(session_data['_rails']).to.not.be.null
      expect(session_data['_rails']['message']).to.be.equal(sample_message)
    })
  })
})

describe('#decipherSessionData', function () {
  it('returns the session from the cookie', function () {
    const cookie = decipherCookies(sample_cookie);
    const session_data = decipherSessionData(cookie)
    expect(session_data['current_user_uuid']).to.equal('95d73bf8-6edf-4a67-b1f9-227398bdd8af')
    expect(session_data['session_id']).to.equal('033ff410bb681720bfd4d03962111b39')
  })
})
