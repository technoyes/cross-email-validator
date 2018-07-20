

const { isNil, isEmpty, isString, merge, not } = require("lodash");
const looksLikeEmail = require("validator/lib/isEmail");
const Promise = require("bluebird");
const URI = require("urijs");

const atSymbol = "@";
const getDnsOverHttpUri = (
  (baseUri) => (domainName) => baseUri.clone().setQuery({name: domainName})
)(new URI("https://cloudflare-dns.com/dns-query").setQuery({
  'type': 'MX',
  'do': true,
  'cd': false,
}));
const getBurnerCheckUri = (
  (baseUri) => (domainName) => baseUri.clone().filename(domainName)
)(new URI("https://open.kickbox.com/v1/disposable/beewell.health"));

const doFetch = (uri, customOptions={}) => Promise.try(() => fetch(uri, merge({
  credentials: 'omit',
  mode: 'no-cors',
  method: 'GET',
}, customOptions)).tap((response) => {
  if(!response.ok) throw new Error("Network error");
}).get("body").call("json"));


module.exports = (addr) => {
  const onError = (msg) => (error) => {
    console.warn(`Error while ${msg}; returning true by default`, { addr, error});
    return true;
  };
  const logResults = (msg) => (result) => console.debug(
    `Results from ${msg} => ${result}`,
    { addr, result }
  );

  const timeLimitMs = 5000;

  const runCheck = (msg, func) => Promise.try(() => func(addr)).timeout(timeLimitMs).catch(onError(msg)).tap(logResults(msg));

  const validatingName = "validating email address";
  return runCheck(validatingName, () => {

    // Basic sanity checks.
    if(isNil(addr)) return false;
    if(!(isString(addr))) return false;
    if(isEmpty(addr.trim())) return false;

    // Ensure that '@' is not the first or last char.
    if(addr.startsWith(atSymbol)) return false;
    if(addr.endsWith(atSymbol)) return false;

    // Now split to get the username and domain name
    const [username, domainName, ...addrExtra] = addr.split(atSymbol);
    if(!(isNil(addrExtra) || isEmpty(addrExtra))) return false;
    if(isNil(username) || isNil(domainName)) return false;
    if(isEmpty(username.trim()) || isEmpty(domainName.trim())) return false;

    // Construct the checks.
    const syntaxCheckName = "performing the syntax check";
    const syntaxCheck = runCheck( syntaxCheckName, looksLikeEmail );

    const mxRecordCheckName = "performing the MX record DNS check";
    const mxRecordCheck = runCheck(
      mxRecordCheckName,
      () => doFetch(
        getDnsOverHttpUri(domainName),
        { headers: { accept: 'application/dns-json' } }
      ).tap((result) => {
        if(result.Status !== 0) {
          throw new Error(`Bad status code from DNS query: ${result.Status}`);
        }
      }).get("Answer").then((answer) => {
        if(isNil(answer)) {
          throw new Error(`No answer returned: ${answer}`);
        }
        if(isEmpty(answer)) {
          return false;
        }
        return true;
      })
    );

    const burnerName = "performing burner e-mail check";
    const burnerCheck = runCheck(
      burnerName,
      () => doFetch(getBurnerCheckUri(domainName)).get("disposable").then((result) => {
        if(isNil(result)) {
          throw new Error(`No result returned: ${result}`);
        }
        return !result;
      })
    );

    const compilingName = "compiling results";
    return runCheck(compilingName, () => Promise.filter([syntaxCheck,mxRecordCheck,burnerCheck], not).then((failures) => isNil(failures) || isEmpty(failures)));

  });
};
