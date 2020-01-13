const puppeteer = require('puppeteer');
var should = require('should');
var utils = require('./test-utils');
var init = require('./test-init');

let browser;
let page, userCredentials;

let email = utils.generateRandomBusinessEmail();
let password = utils.generateRandomString();
const user = { email, password };

describe('Resend Verification API', () => {

   	beforeAll(async () => {

		jest.setTimeout(15000);
		browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
		page = await browser.newPage();
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
		// intercept request and mock response for login
		await page.setRequestInterception(true);
		await page.on('request', async (request) => {
			if ((await request.url()).match(/user\/login/)) {
				request.respond({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(userCredentials)
				});
			} else {
				request.continue();
			}
		});
		await page.on('response', async (response) => {
			try {
				var res = await response.json();
				if (res && res.tokens) {
					userCredentials = res;
				}
			} catch (error) { }
		});
  	});

	afterAll(async () => {
		await browser.close();
	});

	it('Should not resend verification token if a user associated with the email does not exist', async () => {
		await page.goto(utils.ACCOUNTS_URL + '/user-verify/resend', { waitUntil: 'networkidle2' });
		await page.waitForSelector('#email');
		await page.click('input[name=email]');
		await page.type('input[name=email]', 'invalid@email.com');
		await page.click('button[type=submit]');
		await page.waitForSelector('#error-msg');
		const html = await page.$eval('#error-msg', (e) => {
			return e.innerHTML;
		});
		should.exist(html);
		html.should.containEql("No user associated with this account");
	}, 160000);

	it('Should resend verification token successfully', async () => {
		await init.registerUser(user, page);
		await page.goto(utils.ACCOUNTS_URL + '/user-verify/resend', { waitUntil: 'networkidle2' });
		await page.waitForSelector('#email');
		await page.click('input[name=email]');
		await page.type('input[name=email]', email);
		await page.click('button[type=submit]');
		await page.waitForSelector('#resend-verification-success');
		const html = await page.$eval('#resend-verification-success', (e) => {
		   return e.innerHTML;
		});
		should.exist(html);
		html.should.containEql(" An email is on its way to you with new verification link. Please don't forget to check spam.");
	 }, 160000);
});
