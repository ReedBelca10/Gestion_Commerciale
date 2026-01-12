const { TOTP, generateURI } = require('otplib');
const t = new TOTP();
console.log('TOTP.verify length:', t.verify.length);
console.log('generateURI length:', generateURI ? generateURI.length : 'undefined');
try {
    // Test verify with object
    t.verify({ token: '123456', secret: '123' });
    console.log('verify({ token, secret }) call: success (threw no error)');
} catch (e) {
    console.log('verify({ token, secret }) call: failed -', e.message);
}

try {
    // Test generateURI with 3 args
    if (generateURI) generateURI('secret', 'issuer', 'label');
    console.log('generateURI(3 args) call: success');
} catch (e) {
    console.log('generateURI(3 args) call: failed -', e.message);
}
