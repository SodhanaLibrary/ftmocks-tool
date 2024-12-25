const isSameRequest = (req1, req2) => {
  let matched = true;
  if(req1.url !== req2.url) {
    matched = false;
  } else if(req1.method !== req2.method) {
    matched = false;
  }
  return matched;
}

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


export function processURL(url, ignoreParams=[]) {
  // Remove the hostname from the URL
  const urlWithoutHost = url.replace(/^(https?:\/\/)?[^\/]+/, '');
  const processedURL = new URL(`http://domain.com${urlWithoutHost}`);
  const params = new URLSearchParams(processedURL.search);
  if(ignoreParams?.length > 0) {
    ignoreParams.forEach(ip => {
      params.delete(ip);
    });
  }
  params.sort();
  return decodeURIComponent(`${processedURL.pathname}?${params}`);
} 

export function compareMockToRequest(mock, req) {
  const mockURL = processURL(mock.url, mock.ignoreParams);
  const reqURL = processURL(req.originalUrl, mock.ignoreParams);
  return isSameRequest({url: mockURL, method: mock.method}, {
    method: req.method,
    url: reqURL,
  });
}

export function makeSubsetActions(actions, tests) {
  let currentActions = [];
  const testActions = {};
  actions.forEach((action) => {
    if(['click', 'type', 'change', 'dblclick', 'contextmenu'].includes(action.type)) {
      currentActions.push(action);
    } else if(['POST', 'PUT', 'PATCH', 'DELETE'].includes(action.type)) {
      const test = tests.find(test => test.mocks.find(mock => compareMockToRequest(mock, {
        originalUrl: action.target,
        method: action.type
      })));
      if(test) {
        if (!testActions[test.name]?.actions) {
          testActions[test.name] = {
            actions: []
          }
        }
        testActions[test.name].actions = testActions[test.name].actions.concat(...currentActions);   
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
            actions: []
          };
        }
        testActions[`${testType} ${lastWord}`].actions = testActions[`${testType} ${lastWord}`].actions.concat(...currentActions);   
      }
      currentActions = [];
    }
  });
  return testActions;
}

export function generateRTLCode(actions, tests = []) {
    const testActions = makeSubsetActions(actions, tests);
    const testCodes = [];
    Object.keys(testActions).forEach(testName => {
      let testCode = testActions[testName].actions.map((action) => {
        switch (action.type) {
          case "click":
            return [
              ``,
              `  await waitFor(() => {expect(getByXPath(dom.container, "${action.target}")).toBeInTheDocument();});`,
              `  fireEvent.click(getByXPath(dom.container, "${action.target}"))`
            ].join('\n');
          case "type":
            return `  fireEvent.type(getByXPath(dom.container, "${action.target}"), "${action.value}");`;
          case "change":
            return `  fireEvent.change(getByXPath(dom.container, "${action.target}"), "${action.value}");`;
          case "dblclick":
            return `  fireEvent.dblClick(getByXPath(dom.container, "${action.target}"));`;
          case "contextmenu":
            return `  fireEvent.contextMenu(getByXPath(dom.container, "${action.target}"));`;
          case "POST":
            return `-------------------------------------------------------------`;
          case "PUT":
            return `-------------------------------------------------------------`;
          case "PATCH":
            return `-------------------------------------------------------------`;
          case "DELETE":
            return `-------------------------------------------------------------`;
          default:
            return null;
        }
      }).filter(cd => !!cd).join("\n");
      testCode = [
        `// ${testName} test case`,
        `it('${testName}', async () => {`,
        `  await initiateFetch(jest, ftmocksConifg, '${testName}');`,
        `  const dom = render(<App />);`,
        testCode,
        `});`,
        ``
      ].join("\n");
      testCodes.push(testCode);
    });
    return testCodes.join("\n");
};

export function generatePlaywrightCode(actions) {
  return actions.map((action) => {
      switch (action.type) {
          case "click":
              return [
                  ``,
                  `await expect(page.locator('${action.target}')).toBeVisible();`,
                  `await page.click('${action.target}');`
              ].join('\n');
          case "type":
              return `await page.fill('${action.target}', '${action.value}');`;
          case "change":
              // Assuming change event can be simulated via filling or selecting a value
              return `await page.fill('${action.target}', '${action.value}');`;
          case "dblclick":
              return `await page.dblclick('${action.target}');`;
          case "contextmenu":
              return `await page.click('${action.target}', { button: 'right' });`;
          case "POST":
              return `-------------------------------------------------------------`;
          case "PUT":
              return `-------------------------------------------------------------`;
          case "PATCH":
              return `-------------------------------------------------------------`;
          case "DELETE":
              return `-------------------------------------------------------------`;
          default:
              return null;
      }
  }).filter(cd => !!cd).join("\n");
};