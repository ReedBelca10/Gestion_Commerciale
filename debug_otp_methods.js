const { TOTP } = require('otplib');
try {
    const t = new TOTP();
    console.log('TOTP instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(t)));
} catch (e) {
    console.log('TOTP instantiation failed:', e.message);
}
