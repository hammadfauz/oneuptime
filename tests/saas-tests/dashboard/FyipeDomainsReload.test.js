const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser, page;
const user = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};

const customDomain = `${utils.generateRandomString()}.com`;

/** This is a test to check:
 * No errors on page reload
 * It stays on the same page on reload
 */

describe('Fyipe Page Reload', () => {
    const operationTimeOut = 100000;

    beforeAll(async done => {
        jest.setTimeout(100000);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        );
        await init.registerUser(user, page); // This automatically routes to dashboard page
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should reload the incidents page and confirm there are no errors',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
            waitUntil: ['networkidle2'],
        });
            await init.pageClick(page, '#projectSettings');
            await init.pageClick(page, '#more');
            await init.pageClick(page, '#domains');
            await init.pageClick(page, '#addCustomField');
            await init.pageType(page, '#domain', customDomain);
            await init.pageClick(page, '#createDomainBtn');
            await page.waitForSelector('#createDomainBtn', { hidden: true });
            await page.waitForSelector('#projectdomain_0', { visible: true });
            //To confirm no errors and stays on the same page on reload
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForSelector('#cbDomains', { visible: true });
            const spanElement = await page.waitForSelector('#projectdomain_0', {
                visible: true,
            });
            expect(spanElement).toBeDefined();
            done();
        },
        operationTimeOut
    );
});