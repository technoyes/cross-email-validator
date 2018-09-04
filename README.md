# cross-email-validator
Goes beyond validating the characters that make up the email, and additionally performs DNS and mailbox checks to ensure that the email address is valid. Does all the network calls using [`cross-fetch`](https://github.com/lquixada/cross-fetch), so it works in the browser, on React Native, on Node, and anywhere else you want to run it.

# Synposis

## Install

```bash
yarn add cross-email-validator
```

## Execute

```javascript
import validateEmail from "cross-email-validator"

await validateEmail("developer+rnev@beewell.health"); // returns true
await validateEmail("@beewell.health"); // returns false
await validateEmail("developer+rnev@health"); // returns false
```

# Validation Phases

## Step 1: Syntax

*These are performed sequentially.*

* It first ensures that the value is a non-empty string, that the character '`@`' is in the address precisely once, and that '`@`' is not the first or last character.
* It then checks that the TLD is in the TLD list given by [tlds](https://www.npmjs.com/package/tlds).
* Then uses [validator/lib/isEmail](https://www.npmjs.com/package/validator) for validating the e-mail address format. This does an extensive amount of checks, with a whole suite of checks specifically for `@gmail.com` addresses.

## Step 2: Network Checks

*These are performed concurrenctly.*

* Calls out to [the `1.1.1.1` DNS over HTTPS server](https://developers.cloudflare.com/1.1.1.1/dns-over-https/) to ensure that there exists at least one MX record for the domain.
* At the same time, calls out to the [Kickbox "disposable email" API](https://open.kickbox.com/v1/disposable/beewell.health) to validate that the e-mail domain is not a disposable email domain.
* It'd be nice to do an SMTP check, but it's unclear how to do that from within React Native without unlinking.

Note that any network check that errors out will be counted as a pass. So if there is no internet, the internet connection is slow, or the server is down, then it is equivalent to the network check returning valid.

# Distribution File

If you're looking for a [Flow](https://flow.org/en/docs/)-free, minified version of the script (say, to include in a webpage), then look
no further than `./dist/index.js`. It is produced using [Parcel](https://parceljs.org/) and automatically updated before every commit.
The browser support is specified in `./.browserslist.rc` -- for more information, see [browserslist on GitHub](https://github.com/browserslist/browserslist).

# License

MIT. See the file named `LICENSE` in this directory for details.

# Inspiration

[email-deep-validator](https://github.com/getconversio/email-deep-validator/)
