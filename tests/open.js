const test = require('ava');
const countBy = require('lodash.countby');
const puppeteer = require('puppeteer-core');
const open = require('../src');

const browserName = 'Google Chrome';
const openUrl = 'http://127.0.0.1:8000/';
let chromeExecutablePath;
if (process.platform === 'darwin') {
  chromeExecutablePath = `/Applications/${browserName}.app/Contents/MacOS/${browserName}`;
} else if (process.platform === 'linux') {
  // https://github.com/mujo-code/puppeteer-headful#usage
  chromeExecutablePath = process.env.PUPPETEER_EXEC_PATH;
} else if (process.platform === 'win32') {
  chromeExecutablePath = 'Chrome';
}

console.info(`
OS: ${process.platform}
Chrome Path: ${chromeExecutablePath}
`);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test.serial('the same tab is reused in browser on macOS', async t => {
  if (process.platform === 'darwin') {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromeExecutablePath,
    });

    // Open url with better-opn twice
    await open(openUrl);
    await open(openUrl);

    // Workaround since new pages are not avaliable immediately
    // https://github.com/puppeteer/puppeteer/issues/1992#issuecomment-444857698
    await sleep(5000);

    // Get open pages/tabs
    const openPages = (await browser.pages()).map(each => each.url());
    const openPagesCounter = countBy(openPages);

    // Expect only one page is open
    t.is(openPagesCounter[openUrl], 1);

    // Close browser
    await browser.close();
  } else {
    // Skip for non-macOS environments
    t.pass();
  }
});

test.serial('open url in browser', async t => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: chromeExecutablePath,
  });

  await open(openUrl);

  // Workaround since new pages are not avaliable immediately
  // https://github.com/puppeteer/puppeteer/issues/1992#issuecomment-444857698
  await sleep(5000);

  // Get open pages/tabs
  const openPages = (await browser.pages()).map(each => each.url());
  const openPagesCounter = countBy(openPages);

  // Expect page is opened
  t.is(openPagesCounter[openUrl], 1);

  await browser.close();
});

test.serial(
  'should not open browser when process.env.BROWSER is none',
  async t => {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: chromeExecutablePath,
    });
    process.env.BROWSER = 'none';

    // Open url
    await open(openUrl);

    // Get open pages/tabs
    const openPages = (await browser.pages()).map(each => each.url());
    const openPagesCounter = countBy(openPages);

    // Expect no page is opened
    t.is(openPagesCounter[openUrl], undefined);

    // Clean up
    process.env.BROWSER = browserName;
    await browser.close();
  }
);
