/*
Copyright SecureKey Technologies Inc. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const constants = require('./constants');
const {allow} = require('./chapi');

const DIDS = constants.dids
const timeout = 60000;

/*************************** Public API ******************************/

exports.init = async ({did}) => {
  // login and consent
  await _getLogin();
  await _getLoginAndAccept();

  // register chapi
  await allow()

  // wait for dashboard
  await _waitForDashboard();

  // setup DIDs
  if (did) {
    await _saveAnyDID({method: did});
  } else {
    await _createTrustblocDID({method: did});
  }
};

exports.authenticate = async ({did}) => {
  await _didAuth({method: did})
};

exports.storeCredentials = async () => {
  await _acceptCredentials();
};

exports.presentCredentials = async ({did}) => {
  await _sendCredentials({method: did});
};

/*************************** Helper functions ******************************/

async function _didAuth({method='trustbloc'} = {}) {
  const selectionDiv = await $(`//div/div[contains(@class, 'md-menu md-select')]`);
  await selectionDiv.waitForExist();
  await selectionDiv.click();

  const selectDID = await $(`#${DIDS[method].name}`)
  await selectDID.waitForExist();
  await selectDID.click();

  const authenticate = await $('#authenticate')
  await authenticate.waitForExist();
  await authenticate.click();
}

async function _acceptCredentials() {
  const storeBtn = await $('#storeVCBtn');
  await storeBtn.waitForExist();
  await storeBtn.waitForClickable();
  await storeBtn.click();
}

async function _sendCredentials({method="trustbloc"} = {}) {
  //expand list
  const selectionDiv = await $(`//div/div[contains(@class, 'md-menu md-select')]`);
  await selectionDiv.waitForExist();
  await selectionDiv.click();

  // select issuer
  const selectDID = await $(`#${DIDS[method].name}`)
  await selectDID.waitForExist();
  await selectDID.click();

  // select VC
  const selectVC = await $('#cred-result-0')
  await selectVC.waitForExist();
  await selectVC.click();

  // share
  const shareBtn = await $('#share-credentials')
  await shareBtn.waitForExist();
  await shareBtn.waitForClickable();
  await shareBtn.click();
}

async function _getLogin() {
  const signinButton = await $('#loginBtn');
  await signinButton.waitForClickable();
  await signinButton.click();

  const selectProvider = await $('=Universal Bank');
  await selectProvider.click();
}

async function _getLoginAndAccept() {
  await browser.waitUntil(async () => {
    let emailInput = await $('#email');
    await emailInput.waitForExist();
    expect(emailInput).toHaveValue('john.smith@example.com');
    await emailInput.setValue(`john.${new Date().getTime()}@test.com`);
    return true;
  });

  const loginButton = await $('#accept');
  await loginButton.click();

  const acceptButton = await $('#accept');
  await acceptButton.click();

  await browser.waitUntil(async () => {
    let title = await $('iframe');
    await title.waitForExist({timeout, interval: 5000});
    return true;
  });
}

async function _waitForDashboard() {
  await browser.waitUntil(async () => {
    let didResponse = await $('#dashboard-success-msg');
    await didResponse.waitForExist({timeout, interval: 5000});
    expect(didResponse).toHaveText('Successfully setup your user');
    return true;
  });
}

async function _saveAnyDID({method}) {
  const didManager = await $('a*=Digital Identity Management');
  await didManager.waitForExist();
  await didManager.click();

  const saveAnyDID = await $('button*=Save Any Digital Identity');
  await saveAnyDID.waitForExist();
  await saveAnyDID.click();

  if (!DIDS[method]) {
    throw `couldn't find did method '${did} in test config'`
  }

  // enter DID
  const didInput = await $('#did');
  await didInput.addValue(DIDS[method].did);

  // enter private key JWK
  const privateKeyJWK = await $('#privateKeyJwk');
  await privateKeyJWK.addValue(DIDS[method].pkjwk);

  // enter KEY ID
  const keyID = await $('#keyID');
  await keyID.addValue(DIDS[method].keyID);

  // select signature Type
  const signType = await $('#selectSignKey');
  await signType.addValue(DIDS[method].signatureType);

  // enter friendly name
  const friendlyName = await $('#anyDIDFriendlyName');
  await friendlyName.addValue(DIDS[method].name);

  const submit = await $('#saveDIDBtn')
  submit.click()

  await browser.waitUntil(async () => {
    let didResponse = await $('#save-anydid-success');
    await didResponse.waitForExist({timeout, interval: 2000});
    expect(didResponse).toHaveText('Saved your DID successfully.');
    return true;
  });

  console.log('saved DID successfully !!')
}


async function _createTrustblocDID() {
  const didManager = await $('a*=Digital Identity Management');
  await didManager.waitForExist();
  await didManager.click();

  const didDashboard = await $('button*=Digital Identity Dashboard');
  await didDashboard.waitForExist();
  await didDashboard.click();

  // select key Type
  const keyType = await $('#selectKey');
  await keyType.addValue(DIDS.trustbloc.keyType);

  // select signature Type
  const signType = await $('#signKey');
  await signType.addValue(DIDS.trustbloc.signatureType);

  // enter friendly name
  const friendlyName = await $('#friendlyName');
  await friendlyName.addValue(DIDS.trustbloc.name);

  const submit = await $('#createDIDBtn')
  submit.click()

  await browser.waitUntil(async () => {
    let didResponse = await $('#create-did-success');
    await didResponse.waitForExist({timeout, interval: 2000});
    expect(didResponse).toHaveText('Saved your DID successfully.');
    return true;
  });

  console.log('created trustbloc DID successfully !!')
}
