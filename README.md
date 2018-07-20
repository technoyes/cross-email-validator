# react-native-email-deep-validator
Goes beyond validating the characters that make up the email, and instead performs checks on the network to ensure that the e-mail address is valid.

# Synposis

```bash
yarn add react-native-email-validator
```

```javascript
import validateEmail from "react-native-email-validator"

await validateEmail("developer+rnev@beewell.health"); // returns true
await validateEmail("@beewell.health"); // returns false
await validateEmail("developer+rnev@health"); // returns false
```

# Validation Phases

## Step 1: Syntax

* It first ensures that the value is a non-empty string, that the character '`@`' is somewhere in that string, and that it is not the first or last character.
* Then uses [validator/lib/isEmail](https://www.npmjs.com/package/validator) for validating the e-mail address format, which amounts to firing a big ugly regexp against it.

## Step 2: Network Checks

* Calls out to [the `1.1.1.1` DNS over HTTPS server](https://developers.cloudflare.com/1.1.1.1/dns-over-https/) to ensure that there exists at least one MX record for the domain.
* At the same time, calls out to the [Kickbox "disposable email" API](https://open.kickbox.com/v1/disposable/beewell.health) to validate that the e-mail domain is not a disposable email domain.
* It'd be nice to do an SMTP check, but it's unclear how to do that from within React Native without unlinking.

Note that any network check that errors out will be counted as a pass. So if there is no internet, the internet connection is very slow, or the server is down, then it is equivalent to the network check returning valid.

# License

MIT. See the file named `LICENSE` in this directory for details.

# Inspiration

[email-deep-validator](https://github.com/getconversio/email-deep-validator/)
