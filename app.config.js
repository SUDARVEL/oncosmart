const fs = require('fs');
const path = require('path');

const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const expo = { ...appJson.expo };
  const googleServicesPath = path.join(__dirname, 'google-services.json');

  if (fs.existsSync(googleServicesPath)) {
    expo.android = {
      ...expo.android,
      googleServicesFile: './google-services.json',
    };
  }

  return expo;
};
