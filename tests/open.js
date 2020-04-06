const test = require('ava');
const countBy = require('lodash.countby');
const {execSync} = require('child_process');
const open = require('../dist'); // Run yarn build prior running the test

const openUrl = 'http://127.0.0.1:8000/';

function getOpenTabs(browserName) {
  if (process.platform !== 'darwin') throw new Error('Only support macOS.');
  const openTabs = execSync(`bash tests/getOpenTabs.sh "${browserName}"`)
    .toString('utf-8')
    .split('\n');
  return openTabs;
}

function closeOpenTbas(browserName) {
  if (process.platform !== 'darwin') throw new Error('Only support macOS.');
  execSync(`bash tests/closeOpenTabs.sh "${browserName}"`);
}

test('if the same tab is reused in browser', async t => {
  const browserName = 'Google Chrome';
  if (process.platform === 'darwin') {
    // Close all open tabs
    closeOpenTbas(browserName);

    // Open url with open twice
    await open(openUrl);
    await open(openUrl);

    // Get open tabs
    const openTabs = getOpenTabs(browserName);
    console.log(openTabs);
    const openTabsCounter = countBy(openTabs);
    t.is(openTabsCounter[openUrl], 1);

    // Clean up
    closeOpenTbas(browserName);
  } else {
    // Skip for non-macOS environments
    t.pass();
  }
});

test('open url in browser', async t => {
  await open(openUrl);
  t.pass();
});
