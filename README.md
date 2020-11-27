# rails5-cookie-parser
Rails 5 (5.2.4.4) cookie parser.

# TL;DR
This works on a standard install of Rails 5.2.4.4. Feel free to write a pull request if you see a way this can be improved. Tests works with what I used on my localhost, and that'll do for now.

# Usage
I'm sure you know these better than me. So first: `npm i rails5-cookie-parser --save`

You'll need to set up your ENV values next:
```
SECRET_KEY_BASE
=> Required. Copy-paste it from +Rails.application.secret_key_base+.
SECRET_KEY_SALT
=> Optional. Hardcoded in Rails to +'authenticated encrypted cookie'+ but you can modify it, it seems?
SECRET_KEY_ITER
SECRET_KEY_LEN
=> Optional. Don't touch them, unless you change them in Rails.
```

Also, you need cookieParser.

And then you can:
```const express = require('express');
const cookieParser = require('cookie-parser');
const railsCookieParser = require('rails5-cookie-parser')

const app = express();
app.use(cookieParser());
app.use(railsCookieParser.decipherRailCookies)
app.use(function (req, res, next) {
  console.log(req.rails_session)
})
...
```

# Credits
Some StackOverflow, a lot of ActiveSupport source code, a [huge help from @rjz](https://gist.github.com/rjz/15baffeab434b8125ca4d783f4116d81), and the rest is me.
