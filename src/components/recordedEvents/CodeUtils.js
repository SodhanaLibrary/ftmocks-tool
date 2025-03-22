const isSameRequest = (req1, req2) => {
  let matched = true;
  if (req1.url !== req2.url) {
    matched = false;
  } else if (req1.method !== req2.method) {
    matched = false;
  }
  return matched;
};

function getLastWordFromApiUrl(apiUrl) {
  // Split the URL into parts by '/'
  const parts = apiUrl.split('/');
  // Filter out any empty parts
  const nonEmptyParts = parts.filter(Boolean);

  // Iterate from the end of the array to find the last alphabetic-only part
  for (let i = nonEmptyParts.length - 1; i >= 0; i--) {
    if (/^[a-zA-Z]+$/.test(nonEmptyParts[i])) {
      return nonEmptyParts[i];
    }
  }

  // Return null or a default value if no alphabetic-only part is found
  return null;
}

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

function getPreviousURLaction(actions, index) {
  for(let i=index; i>=0; i--) {
    if(actions[i].type === 'url') {
      return actions[i];
    }
  }
  return null;
}

export function makeSubsetActions(actions, tests) {
  let currentActions = [];
  const testActions = {};
  actions.forEach((action, cindex) => {
    if (
      ['click', 'type', 'change', 'dblclick', 'contextmenu'].includes(
        action.type
      )
    ) {
      currentActions.push(action);
    } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(action.type)) {
      const urlAction = getPreviousURLaction(actions, cindex);
      if(urlAction) {
        currentActions = [urlAction, ...currentActions];
      }
      const test = tests.find((test) =>
        test.mocks.find((mock) =>
          compareMockToRequest(mock, {
            originalUrl: action.target,
            method: action.type,
          })
        )
      );
      if (test) {
        if (!testActions[test.name]?.actions) {
          testActions[test.name] = {
            actions: [],
          };
        }
        testActions[test.name].actions = testActions[test.name].actions.concat(
          ...currentActions
        );
      } else {
        let testType = 'create';
        if (action.type === 'POST') {
          testType = 'create';
        } else if (action.type === 'PUT') {
          testType = 'update';
        } else if (action.type === 'DELETE') {
          testType = 'delete';
        } else if (action.type === 'PATCH') {
          testType = 'patch';
        }
        const lastWord = getLastWordFromApiUrl(action.target);
        if (!testActions[`${testType} ${lastWord}`]?.actions) {
          testActions[`${testType} ${lastWord}`] = {
            actions: [],
          };
        }
        testActions[`${testType} ${lastWord}`].actions = testActions[
          `${testType} ${lastWord}`
        ].actions.concat(...currentActions);
      }
      currentActions = [];
    }
  });
  if (currentActions.length > 0) {
    if (!testActions[`ftmocks basic render`]?.actions) {
      testActions[`ftmocks basic render`] = {
        actions: currentActions,
      };
    }
  }
  return testActions;
}

export function generateRTLCode(actions, tests = [], selectedTest) {
  const testActions = makeSubsetActions(actions, tests);
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

export function generatePlaywrightCode(actions, tests = [], selectedTest) {
  const testActions = makeSubsetActions(actions, tests);
  const testCodes = [];
  
  Object.keys(testActions).forEach((testName) => {
    let testCode = testActions[testName].actions
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
    const url = testActions[testName].actions[0]?.type === 'url' ? testActions[testName].actions[0].value : 'http://your-app-url';
    
    testCode = [
      `// ${selectedTest?.name || testName} test case`,
      `test('${selectedTest?.name || testName}', async ({ page }) => {`,
      `  await initiatePlaywrightRoutes(page, ftmocksConifg, '${selectedTest?.name || testName}');`,
      `  await page.goto('${url}');`,
      testCode,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generateCypressCode(actions, tests = []) {
  const testActions = makeSubsetActions(actions, tests);
  const testCodes = [];
  Object.keys(testActions).forEach((testName) => {
    let testCode = testActions[testName].actions
      .map((action) => {
        switch (action.type) {
          case 'click':
            return `cy.xpath("${action.target}").should('exist').click();`;
          case 'type':
            return `cy.xpath("${action.target}").type("${action.value}");`;
          case 'change':
            return `cy.xpath("${action.target}").clear().type("${action.value}");`;
          case 'dblclick':
            return `cy.xpath("${action.target}").dblclick();`;
          case 'contextmenu':
            return `cy.xpath("${action.target}").rightclick();`;
          case 'POST':
            return `cy.request('POST', '${action.target}', { body: ${action.value} });`;
          case 'PUT':
            return `cy.request('PUT', '${action.target}', { body: ${action.value} });`;
          case 'PATCH':
            return `cy.request('PATCH', '${action.target}', { body: ${action.value} });`;
          case 'DELETE':
            return `cy.request('DELETE', '${action.target}');`;
          default:
            return null;
        }
      })
      .filter((cd) => !!cd)
      .join('\n');
    testCode = [
      `// ${testName} test case`,
      `it('${testName}', () => {`,
      `  cy.visit('/');`,
      testCode,
      `});`,
    ].join('\n');
    testCodes.push(testCode);
  });
  return testCodes.join('\n');
}

export function generateTestCafeCode(actions, tests = []) {
  const testActions = makeSubsetActions(actions, tests);
  const testCodes = [];
  Object.keys(testActions).forEach((testName) => {
    let testCode = testActions[testName].actions
      .map((action) => {
        switch (action.type) {
          case 'click':
            return `await t.click(Selector('${action.target}'));`;
          case 'type':
            return `await t.typeText(Selector('${action.target}'), '${action.value}');`;
          case 'change':
            return `await t.typeText(Selector('${action.target}'), '${action.value}', { replace: true });`;
          case 'dblclick':
            return `await t.doubleClick(Selector('${action.target}'));`;
          case 'contextmenu':
            return `await t.rightClick(Selector('${action.target}'));`;
          case 'POST':
            return `// Custom POST request logic here if needed.`;
          case 'PUT':
            return `// Custom PUT request logic here if needed.`;
          case 'PATCH':
            return `// Custom PATCH request logic here if needed.`;
          case 'DELETE':
            return `// Custom DELETE request logic here if needed.`;
          default:
            return null;
        }
      })
      .filter((code) => !!code)
      .join('\n');
    testCode = [
      `// ${testName} test case`,
      `test('${testName}', async t => {`,
      `    // Add any setup code or mocks here`,
      `    ${testCode}`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });
  return testCodes.join('\n');
}

export function generateRobotFrameworkCode(actions, tests = []) {
  const testActions = makeSubsetActions(actions, tests);
  const testCodes = [];

  Object.keys(testActions).forEach((testName) => {
    const testSteps = testActions[testName].actions
      .map((action) => {
        switch (action.type) {
          case 'click':
            return `Click Element    ${action.target}`;
          case 'type':
            return `Input Text    ${action.target}    ${action.value}`;
          case 'change':
            return `Input Text    ${action.target}    ${action.value}    replace=True`;
          case 'dblclick':
            return `Double Click Element    ${action.target}`;
          case 'contextmenu':
            return `Right Click Element    ${action.target}`;
          case 'POST':
            return `# Custom logic for POST requests`;
          case 'PUT':
            return `# Custom logic for PUT requests`;
          case 'PATCH':
            return `# Custom logic for PATCH requests`;
          case 'DELETE':
            return `# Custom logic for DELETE requests`;
          default:
            return `# Unsupported action type: ${action.type}`;
        }
      })
      .filter((code) => code)
      .join('\n');

    const testCase = `
*** Test Cases ***
${testName}
    [Setup]    Log    Setting up test: ${testName}
${testSteps}
    [Teardown]    Log    Cleaning up test: ${testName}
    `;
    testCodes.push(testCase);
  });

  return testCodes.join('\n');
}


