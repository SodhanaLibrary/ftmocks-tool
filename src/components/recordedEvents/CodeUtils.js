const isSameRequest = (req1, req2) => {
  let matched = true;
  if (req1.url !== req2.url) {
    matched = false;
  } else if (req1.method !== req2.method) {
    matched = false;
  }
  return matched;
};

export function processURL(url, ignoreParams = []) {
  // Remove the hostname from the URL
  const urlWithoutHost = url.replace(/^(https?:\/\/)?[^\/]+/, '');
  const processedURL = new URL(`http://domain.com${urlWithoutHost}`);
  const params = new URLSearchParams(processedURL.search);
  if (ignoreParams?.length > 0) {
    ignoreParams.forEach((ip) => {
      params.delete(ip);
    });
  }
  params.sort();
  return decodeURIComponent(`${processedURL.pathname}?${params}`);
}

export function compareMockToRequest(mock, req) {
  const mockURL = processURL(mock.url, mock.ignoreParams);
  const reqURL = processURL(req.originalUrl, mock.ignoreParams);
  return isSameRequest(
    { url: mockURL, method: mock.method },
    {
      method: req.method,
      url: reqURL,
    }
  );
}

export function generateRTLCode(actions, tests = [], selectedTest) {
  const testActions = {
    [selectedTest?.name]: {
      actions: actions,
    },
  };
  const testCodes = [];
  Object.keys(testActions).forEach((testName) => {
    let testCode = testActions[testName].actions
      .map((action) => {
        switch (action.type) {
          case 'click':
            return [
              ``,
              `  await waitFor(() => {expect(getByXPath(dom.container, "${action.target}")).toBeInTheDocument();});`,
              `  fireEvent.click(getByXPath(dom.container, "${action.target}"))`,
            ].join('\n');
          case 'type':
            return `  fireEvent.type(getByXPath(dom.container, "${action.target}"), "${action.value}");`;
          case 'change':
            return `  fireEvent.change(getByXPath(dom.container, "${action.target}"), "${action.value}");`;
          case 'dblclick':
            return `  fireEvent.dblClick(getByXPath(dom.container, "${action.target}"));`;
          case 'contextmenu':
            return `  fireEvent.contextMenu(getByXPath(dom.container, "${action.target}"));`;
          case 'POST':
            return `-------------------------------------------------------------`;
          case 'PUT':
            return `-------------------------------------------------------------`;
          case 'PATCH':
            return `-------------------------------------------------------------`;
          case 'DELETE':
            return `-------------------------------------------------------------`;
          default:
            return null;
        }
      })
      .filter((cd) => !!cd)
      .join('\n');
    testCode = [
      `// ${selectedTest?.name || testName} test case`,
      `it('${selectedTest?.name || testName}', async () => {`,
      `  await initiateJestFetch(jest, ftmocksConifg, '${selectedTest?.name || testName}');`,
      `  const dom = render(<App />);`,
      testCode,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });
  return testCodes.join('\n');
}

export function generatePlaywrightCode(
  actions,
  tests = [],
  selectedTest,
  envDetails
) {
  const testActions = {
    [selectedTest?.name]: {
      actions: actions,
    },
  };

  const testCodes = [];

  const getLocator = (action) => {
    if (action.target.split('/').length > 6 && action.selectors.length > 0) {
      const locators = action.selectors.filter(
        (selector) => selector.type === 'locator'
      );
      return locators.length > 0 ? locators[0].value : action.target;
    }
    return action.target;
  };

  Object.keys(testActions).forEach((testName) => {
    let testCode = testActions[testName].actions
      .filter(
        (action, index) =>
          action.target &&
          (action.type !== 'input' ||
            (action.type === 'input' &&
              testActions[testName].actions?.[index + 1]?.type !== 'input'))
      )
      .map((action) => {
        const locator = getLocator(action);
        switch (action.type) {
          case 'click':
            return `  await page.locator("${locator}").click();`;
          case 'type':
            if (action.element.type === 'input') {
              return `  await page.locator("${locator}").fill('${action.value}');`;
            }
            if (action.element.type === 'textarea') {
              return `  await page.locator("${locator}").fill('${action.value}');`;
            }
            if (action.element.type === 'select') {
              return `  await page.locator("${locator}").selectOption('${action.value}');`;
            }
            return `  await page.locator("${locator}").type('${action.value}');`;
          case 'input':
            if (action.element.type === 'input') {
              return `  await page.locator("${locator}").fill('${action.value}');`;
            }
            if (action.element.type === 'textarea') {
              return `  await page.locator("${locator}").fill('${action.value}');`;
            }
            if (action.element.type === 'select') {
              return `  await page.locator("${locator}").selectOption('${action.value}');`;
            }
            return `  await page.locator("${locator}").type('${action.value}');`;
          case 'change':
            if (action.element.type === 'input') {
              return `  await page.locator("${locator}").fill('${action.value}');`;
            }
            //return `  await page.locator("${locator}").evaluate(el => el.value = '${action.value}');`;
            // TODO: Handle change event for select
            return '';
          case 'dblclick':
            return `  await page.locator("${locator}").dblclick();`;
          case 'contextmenu':
            return `  await page.locator("${locator}").click({ button: 'right' });`;
          default:
            return null;
        }
      })
      .filter((cd) => !!cd)
      .join('\n');
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    testCode = [
      `// ${selectedTest?.name || testName} test case`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes } from 'ftmocks-utils';

test('${selectedTest?.name || testName}', async ({ page }) => {`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        '${selectedTest.name}'
      );`,
      `  await page.goto('${url}');`,
      testCode,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function nameToFolder(name) {
  const replaceAll = (str, find, replace) => {
    return str.split(find).join(replace);
  };
  const result = replaceAll(name, ' ', '_');
  return result;
}
