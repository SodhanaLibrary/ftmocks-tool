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

  Object.keys(testActions).forEach((testName) => {
    let testCode = testActions[testName].actions
      .filter((action) => action.target)
      .map((action) => {
        switch (action.type) {
          case 'click':
            return `  await page.locator("${action.target}").click();`;
          case 'type':
            return `  await page.locator("${action.target}").fill('${action.value}');`;
          case 'change':
            return `  await page.locator("${action.target}").evaluate(el => el.value = '${action.value}');`;
          case 'dblclick':
            return `  await page.locator("${action.target}").dblclick();`;
          case 'contextmenu':
            return `  await page.locator("${action.target}").click({ button: 'right' });`;
          case 'POST':
            return `//-------------------------------------------------------------`;
          case 'PUT':
            return `//-------------------------------------------------------------`;
          case 'PATCH':
            return `//-------------------------------------------------------------`;
          case 'DELETE':
            return `//-------------------------------------------------------------`;
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
