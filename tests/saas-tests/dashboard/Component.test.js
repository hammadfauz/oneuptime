const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');

// user credentials
const user = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};
const componentName = utils.generateRandomString();
const newComponentName = utils.generateRandomString();
const monitorName = utils.generateRandomString();
const newMonitorName = utils.generateRandomString();
const applicationLogName = utils.generateRandomString();
describe('Components', () => {
    const operationTimeOut = init.timeout;

    let browser, page;

    beforeAll(async () => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);

        await page.setUserAgent(utils.agent);
        browser = await puppeteer.launch({
            ...utils.puppeteerLaunchConfig,
        });
        page = await browser.newPage();

        await init.registerUser(user, page);
    });

    afterAll(async () => {
        await browser.close();
        await browser.idle();
        await browser.close();
    });

    test(
        'Should show indicator on how to invite new Team members since no other member exist, then goto team page ',
        async () => {
            // Navigate to home page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            const componentBoxElement = await page.waitForSelector(
                '#info-teamMember'
            );
            expect(componentBoxElement).toBeDefined();

            let spanElement;
            spanElement = await page.waitForSelector(
                `span#box-header-teamMember`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly('Invite your Team');

            // click on the call to action button
            await page.waitForSelector('#gotoPage-teamMember');
            await page.$eval('#gotoPage-teamMember', e => e.click());

            const componentFormElement = await page.waitForSelector(
                `#teamMemberPage`
            );
            expect(componentFormElement).toBeDefined();
        },
        operationTimeOut
    );
    test(
        'Should show indicator on how to create a component since no component exist, then goto component creation ',
        async () => {
            // Navigate to home page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            const componentBoxElement = await page.waitForSelector(
                '#info-component'
            );
            expect(componentBoxElement).toBeDefined();

            let spanElement;
            spanElement = await page.waitForSelector(
                `span#box-header-component`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly('Create your first Component');

            // click on the call to action button
            await page.waitForSelector('#gotoPage-component');
            await page.$eval('#gotoPage-component', e => e.click());

            const componentFormElement = await page.waitForSelector(
                '#form-new-component'
            );
            expect(componentFormElement).toBeDefined();
        },
        operationTimeOut
    );
    test(
        'Should create new component',
        async () => {
            // Navigate to Components page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            await page.waitForSelector('#components');
            await page.$eval('#components', e => e.click());
            // Fill and submit New Component form
            await page.waitForSelector('#form-new-component');
            await init.pageType(page, 'input[id=name]', componentName);
            await page.$eval('button[type=submit]', e => e.click());
            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#components', { visible: true });
            await page.$eval('#components', e => e.click());

            let spanElement;
            spanElement = await page.waitForSelector(
                `span#component-title-${componentName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(componentName);
        },
        operationTimeOut
    );
    test(
        'Should show indicator on how to create a monitor since a component exist, then goto monitor creation',
        async () => {
            // Navigate to home page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });

            const monitorBoxElement = await page.waitForSelector(
                '#info-monitor'
            );
            expect(monitorBoxElement).toBeDefined();

            let spanElement;
            spanElement = await page.waitForSelector(`span#box-header-monitor`);
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly('Create a Monitor');

            // click on the call to action button
            await page.waitForSelector('#gotoPage-monitor');
            await page.$eval('#gotoPage-monitor', e => e.click());

            // Navigate to Component details
            await page.waitForSelector(`#more-details-${componentName}`);
            await page.$eval(`#more-details-${componentName}`, e => e.click());
            await page.waitForSelector('#form-new-monitor');
        },
        operationTimeOut
    );

    test(
        'should show the correct path on the breadcrumbs inside a component',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#components', { visible: true });
            await page.$eval('#components', e => e.click());

            const moreBtn = `#more-details-${componentName}`;
            await page.waitForSelector(moreBtn, { visible: true });
            await page.$eval(moreBtn, e => e.click());

            const projectSelector = `#cbUnnamedProject`;
            const componentSelector = `#cb${componentName}`;
            await page.waitForSelector(projectSelector, { visible: true });
            const projectBreadcrumb = await page.evaluate(
                projectSelector =>
                    document.querySelector(projectSelector).textContent,
                projectSelector
            );
            await page.waitForSelector(componentSelector, {
                visible: true,
            });
            const componentBreadcrumb = await page.evaluate(
                componentSelector =>
                    document.querySelector(componentSelector).textContent,
                componentSelector
            );

            expect(projectBreadcrumb).toBe('Unnamed Project');
            expect(componentBreadcrumb).toBe(componentName);

            done();
        },
        operationTimeOut
    );

    test(
        'Should not create new component when details are incorrect',
        async () => {
            // Navigate to Components page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            await page.waitForSelector('#components');
            await page.$eval('#components', e => e.click());

            // Fill and submit New Component form with incorrect details
            await page.waitForSelector('#form-new-component');
            await page.waitForSelector('#name');
            await page.$eval('button[type=submit]', e => e.click());

            let spanElement = await page.$(
                '#form-new-component span#field-error'
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly('This field cannot be left blank');
        },
        operationTimeOut
    );
    test(
        'Should show indicator on how to create monitor',
        async () => {
            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);

            const customTutorialType = 'monitor';
            // confirm that monitor box exist on component details page
            const componentBoxElement = await page.waitForSelector(
                `#info-${customTutorialType}`
            );
            expect(componentBoxElement).toBeDefined();
        },
        operationTimeOut
    );

    test(
        'Should create a new monitor in component and confirm that monitor quick tip shows',
        async () => {
            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);

            await page.waitForSelector('#form-new-monitor');
            await init.pageClick(page, 'input[id=name]');
            await init.pageType(page, 'input[id=name]', monitorName);
            await init.pageClick(page, '[data-testId=type_url]');
            await page.waitForSelector('#url', { visible: true });
            await init.pageClick(page, '#url');
            await init.pageType(page, '#url', 'https://google.com');
            await page.$eval('button[type=submit]', e => e.click());

            let spanElement = await page.waitForSelector(
                `#monitor-title-${monitorName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(monitorName);

            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);

            const customTutorialType = 'monitor';
            // find monitor quick tip and confirm it shows
            const monitorQuickTip = await page.waitForSelector(
                `#quick-tip-${customTutorialType}`
            );
            expect(monitorQuickTip).toBeDefined();
        },
        operationTimeOut
    );

    test(
        'Should create a new monitor in component and goto the details page after creating',
        async () => {
            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);
            const newMonitorName = `another-${monitorName}`;
            await page.waitForSelector('#form-new-monitor');
            await init.pageClick(page, 'input[id=name]');
            await init.pageType(page, 'input[id=name]', newMonitorName);
            await init.pageClick(page, '[data-testId=type_url]');
            await page.waitForSelector('#url', { visible: true });
            await init.pageClick(page, '#url');
            await init.pageType(page, '#url', 'https://google.com');
            await page.$eval('button[type=submit]', e => e.click());

            let spanElement = await page.waitForSelector(
                `#monitor-title-${newMonitorName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(newMonitorName);

            // check if the tabs on the details page are defined
            const monitorTabsComponent = await page.waitForSelector(
                `#customTabList`
            );
            expect(monitorTabsComponent).toBeDefined();
        },
        operationTimeOut
    );

    test(
        'should show the correct path on the breadcrumbs when viewing a particular monitor',
        async done => {
            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);
            const monitorDetailsBtn = `#more-details-${monitorName}`;
            await page.waitForSelector(monitorDetailsBtn, {
                visible: true,
            });
            await page.$eval(monitorDetailsBtn, e => e.click());

            const projectSelector = `#cbUnnamedProject`;
            const componentSelector = `#cb${componentName}`;
            const monitorSelector = `#cb${monitorName}`;
            await page.waitForSelector(projectSelector, { visible: true });
            await page.waitForSelector(componentSelector, {
                visible: true,
            });
            await page.waitForSelector(monitorSelector, { visible: true });

            const projectBreadcrumb = await page.evaluate(
                projectSelector =>
                    document.querySelector(projectSelector).textContent,
                projectSelector
            );
            const componentBreadcrumb = await page.evaluate(
                componentSelector =>
                    document.querySelector(componentSelector).textContent,
                componentSelector
            );
            const monitorBreadcrumb = await page.evaluate(
                monitorSelector =>
                    document.querySelector(monitorSelector).textContent,
                monitorSelector
            );
            expect(projectBreadcrumb).toBe('Unnamed Project');
            expect(componentBreadcrumb).toBe(componentName);
            expect(monitorBreadcrumb).toBe(monitorName);

            done();
        },
        operationTimeOut
    );

    test(
        'Should create a new log container in component',
        async () => {
            // Navigate to Component details
            await init.navigateToComponentDetails(componentName, page);

            await page.waitForSelector('#logs');
            await init.pageClick(page, '#logs');

            // Fill and submit New Application  log form
            await page.waitForSelector('#form-new-application-log');
            await init.pageType(page, 'input[id=name]', applicationLogName);
            await page.$eval('button[type=submit]', e => e.click());

            let spanElement;
            spanElement = await page.waitForSelector(
                `span#application-log-title-${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();
            spanElement.should.be.exactly(applicationLogName);
        },
        operationTimeOut
    );

    test(
        'Should create a new monitor in a new component and get list of resources',
        async () => {
            // Navigate to Components page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            await page.waitForSelector('#components');
            await page.$eval('#components', e => e.click());

            // Fill and submit New Component form
            await page.waitForSelector('#form-new-component');
            await init.pageType(page, 'input[id=name]', newComponentName);
            await page.$eval('button[type=submit]', e => e.click());

            await page.waitForSelector('#form-new-monitor');
            await init.pageClick(page, 'input[id=name]');
            await init.pageType(page, 'input[id=name]', newMonitorName);
            await init.pageClick(page, '[data-testId=type_url]');
            await page.waitForSelector('#url', { visible: true });
            await init.pageClick(page, '#url');
            await init.pageType(page, '#url', 'https://google.com');
            await page.$eval('button[type=submit]', e => e.click());
            await page.waitForSelector(`#cb${newMonitorName}`, {
                visible: true,
            });

            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#components');
            await page.$eval('#components', e => e.click());

            await page.waitForSelector('.ball-beat', { hidden: true });

            await page.waitForSelector('#component0', { visible: true });

            const newComponentSelector = `#count_${newComponentName}`;
            const componentSelector = `#count_${componentName}`;

            await page.waitForSelector(newComponentSelector);
            const newResourceCount = await page.$eval(
                newComponentSelector,
                elem => elem.textContent
            );
            expect(newResourceCount).toEqual('1 Resource');

            await page.waitForSelector(componentSelector);
            const firstResourceCount = await page.$eval(
                componentSelector,
                elem => elem.textContent
            );
            expect(firstResourceCount).toEqual('3 Resources');
        },
        operationTimeOut
    );

    test(
        'Should create an incident in monitor details and change monitor status in component list',
        async () => {
            // launch component page
            await init.loginUser(user, page);
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            await page.waitForSelector('#components');
            await page.$eval('#components', e => e.click());
            let componentSpanElement = await page.waitForSelector(
                `#resource_type_${monitorName}`
            );
            componentSpanElement = await componentSpanElement.getProperty(
                'innerText'
            );
            componentSpanElement = await componentSpanElement.jsonValue();

            expect(componentSpanElement).toMatch('Website Monitor');

            const monitorPage = page;
            await init.navigateToMonitorDetails(
                componentName,
                monitorName,
                monitorPage
            );
            await monitorPage.bringToFront();

            await monitorPage.waitForSelector(
                `#monitorCreateIncident_${monitorName}`
            );
            await monitorPage.$eval(
                `#monitorCreateIncident_${monitorName}`,
                e => e.click()
            );
            await monitorPage.waitForSelector('#createIncident');
            await init.selectByText('#incidentType', 'Offline', monitorPage);
            await init.selectByText('#incidentPriority', 'Low', monitorPage);
            await init.pageClick(monitorPage, '#createIncident');
            await monitorPage.waitForSelector('#createIncident', {
                hidden: true,
            });

            // close incident modal
            await page.waitForSelector('#closeIncident_0', {
                visible: true,
            });
            await page.$eval('#closeIncident_0', elem => elem.click());

            await page.bringToFront();
            // check that the monitor is offline on component page
            componentSpanElement = await page.waitForSelector(
                `#resource_status_${monitorName}`
            );
            componentSpanElement = await componentSpanElement.getProperty(
                'innerText'
            );
            componentSpanElement = await componentSpanElement.jsonValue();

            expect(componentSpanElement).toMatch('Offline');
            // bring monitor window to the front so as to resolve incident
            await monitorPage.bringToFront();
            // open incident details
            await monitorPage.waitForSelector(`#incident_${monitorName}_0`);
            await monitorPage.$eval(`#incident_${monitorName}_0`, e =>
                e.click()
            );

            // click acknowledge button
            // acknowledge incident
            await monitorPage.waitForSelector('#btnAcknowledge_0');
            await monitorPage.$eval('#btnAcknowledge_0', e => e.click());
            await monitorPage.waitForSelector('#btnAcknowledge_0');

            // click resolve button
            // resolve incident
            await monitorPage.waitForSelector('#btnResolve_0');
            await monitorPage.$eval('#btnResolve_0', e => e.click());
            await monitorPage.waitForSelector('#ResolveText_0');
            // confirm it is resolved here
            const resolveTextSelector = await monitorPage.$('#ResolveText_0');
            expect(resolveTextSelector).not.toBeNull();

            // goto component page
            await page.bringToFront();
            await page.reload({ waitUntil: 'networkidle0' });
            // confirm that the monitor is back online!
            componentSpanElement = await page.waitForSelector(
                `#resource_status_${monitorName}`
            );
            componentSpanElement = await componentSpanElement.getProperty(
                'innerText'
            );
            componentSpanElement = await componentSpanElement.jsonValue();

            expect(componentSpanElement).toMatch('Online');
        },
        operationTimeOut
    );

    test(
        'Should get list of resources and confirm their types match',
        async () => {
            // Navigate to Components page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            await page.waitForSelector('#components');
            await page.$eval('#components', e => e.click());

            await page.waitForSelector('.ball-beat', { hidden: true });

            await page.waitForSelector(`#count_${componentName}`);
            const firstResourceCount = await page.$eval(
                `#count_${componentName}`,
                elem => elem.textContent
            );
            expect(firstResourceCount).toEqual('3 Resources');

            let spanElement = await page.waitForSelector(
                `#resource_type_${monitorName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();

            expect(spanElement).toMatch('Website Monitor');

            spanElement = await page.waitForSelector(
                `#resource_type_${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();

            expect(spanElement).toMatch('Log Container');

            spanElement = await page.waitForSelector(
                `#resource_status_${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();

            expect(spanElement).toMatch('No Logs Yet');
        },
        operationTimeOut
    );

    test(
        'Should get list of resources and  navigate to each page',
        async () => {
            // Navigate to Components page
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: 'networkidle0',
            });
            await page.waitForSelector('#components');
            await page.$eval('#components', e => e.click());

            await page.waitForSelector('.ball-beat', { hidden: true });

            await page.waitForSelector(`#count_${componentName}`);
            const firstResourceCount = await page.$eval(
                `#count_${componentName}`,
                elem => elem.textContent
            );
            expect(firstResourceCount).toEqual('3 Resources'); // one log container and two monitor

            await page.$eval(`#view-resource-${applicationLogName}`, e =>
                e.click()
            );

            let spanElement = await page.waitForSelector(
                `#application-log-title-${applicationLogName}`
            );
            spanElement = await spanElement.getProperty('innerText');
            spanElement = await spanElement.jsonValue();

            expect(spanElement).toMatch(applicationLogName);
        },
        operationTimeOut
    );

    test('should edit a component in the component settings SideNav', async () => {
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle0',
        });

        await page.waitForSelector('#components', { visible: true });
        await page.$eval('#components', e => e.click());

        await init.pageClick(page, `#more-details-${componentName}`);

        await page.waitForSelector('#componentSettings');
        await init.pageClick(page, '#componentSettings');

        await page.waitForSelector('input[name=name]');
        await init.pageType(page, 'input[name=name]', '-two');
        await page.$eval('#editComponentButton', e => e.click());

        let spanElement = await page.waitForSelector(
            `span#component-title-${componentName}-two`
        );
        spanElement = await spanElement.getProperty('innerText');
        spanElement = await spanElement.jsonValue();
        spanElement.should.be.exactly(`${componentName}-two`);
    });

    test('should delete a component in the component settings sideNav', async () => {
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle0',
        });

        await page.waitForSelector('#components', { visible: true });
        await init.pageClick(page, '#components');

        await init.pageClick(page, `#more-details-${componentName}-two`);

        await page.waitForSelector('#componentSettings');
        await init.pageClick(page, '#componentSettings');

        await page.waitForSelector('#advanced');
        await init.pageClick(page, '#advanced');

        await page.waitForSelector(`#delete-component-${componentName}-two`, {
            visible: true,
        });
        await init.pageClick(page, `#delete-component-${componentName}-two`);

        await page.waitForSelector('#deleteComponent', { visible: true });
        await init.pageClick(page, '#deleteComponent'); // after deleting the component

        const componentClicked = await page.waitForSelector('#components', {
            visible: true,
        });
        expect(componentClicked).toBeDefined();
    });

    test(
        'Should create new project from incident page and redirect to the home page and not component page',
        async () => {
            // Navigate to Monitor details
            await init.navigateToMonitorDetails(
                newComponentName,
                newMonitorName,
                page
            );
            await page.waitForSelector(
                `#monitorCreateIncident_${newMonitorName}`
            );
            await page.$eval(`#monitorCreateIncident_${newMonitorName}`, e =>
                e.click()
            );
            await page.waitForSelector('#createIncident');
            await init.selectByText('#incidentType', 'Offline', page);
            await init.selectByText('#incidentPriority', 'Low', page);
            await page.$eval('#createIncident', e => e.click());
            await page.waitForSelector('#createIncident', { hidden: true });

            // close incident modal
            await page.waitForSelector('#closeIncident_0', {
                visible: true,
            });
            await page.$eval('#closeIncident_0', elem => elem.click());

            await page.waitForSelector(`#incident_${newMonitorName}_0`);
            await page.$eval(`#incident_${newMonitorName}_0`, e => e.click());

            await page.waitForSelector('#AccountSwitcherId');
            await page.$eval('#AccountSwitcherId', e => e.click());
            await page.waitForSelector('#create-project');
            await page.$eval('#create-project', e => e.click());
            await page.waitForSelector('#name');
            await init.pageType(
                page,
                'input[id=name]',
                utils.generateRandomString()
            );
            await page.$eval('label[for=Startup_month]', e => e.click());
            await page.$eval('button[type=submit]', e => e.click());

            let currentPage = await page.waitForSelector('#cbHome', {
                visible: true,
            });
            currentPage = await currentPage.getProperty('innerText');
            currentPage = await currentPage.jsonValue();
            currentPage.should.be.exactly('Home');
        },
        operationTimeOut
    );
});