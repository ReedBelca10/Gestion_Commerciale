const otplib = require('otplib');
console.log('Exports from otplib:', Object.keys(otplib));
try {
    const { authenticator } = require('otplib');
    console.log('Authenticator found:', !!authenticator);
} catch (e) {
    console.error(e);
}
