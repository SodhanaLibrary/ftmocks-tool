// Produces a properly quoted and escaped JS string literal so recorded
// values/selectors (which may contain quotes, backslashes, or newlines)
// don't break the syntax of the generated test code.
function jsStringLiteral(value) {
  return JSON.stringify(String(value ?? ''));
}

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

export function generateRTLCode(
  actions,
  tests = [],
  selectedTest,
  envDetails
) {
  const testName = selectedTest?.name || 'Recorded test';
  // Path to the root App component, relative to the tests directory. Taken
  // directly from REACT_APP_FROM_TESTS_DIR in ftmocks.env (via envDetails).
  const REACT_APP_FROM_TESTS_DIR = envDetails?.REACT_APP_FROM_TESTS_DIR;

  const body = (actions || [])
    .map((action) => {
      switch (action.type) {
        case 'click':
          return [
            ``,
            `  await waitFor(() => {expect(getByXPath(dom.container, ${jsStringLiteral(action.target)})).toBeInTheDocument();});`,
            `  fireEvent.click(getByXPath(dom.container, ${jsStringLiteral(action.target)}))`,
          ].join('\n');
        case 'type':
        case 'change':
        case 'input':
          return `  fireEvent.change(getByXPath(dom.container, ${jsStringLiteral(action.target)}), { target: { value: ${jsStringLiteral(action.value)} } });`;
        case 'dblclick':
          return `  fireEvent.dblClick(getByXPath(dom.container, ${jsStringLiteral(action.target)}));`;
        case 'contextmenu':
          return `  fireEvent.contextMenu(getByXPath(dom.container, ${jsStringLiteral(action.target)}));`;
        case 'POST':
        case 'PUT':
        case 'PATCH':
        case 'DELETE':
          return `  // ${action.type} ${action.target || ''}`;
        default:
          return null;
      }
    })
    .filter((cd) => !!cd)
    .join('\n');

  // Self-contained header: only depends on the app root (../App), plus an
  // inline getByXPath helper — so the generated test runs without any
  // project-specific test scaffolding and without relying on a particular
  // ftmocks-utils version. The ftmocks config is inlined below rather than
  // imported from a separate './test-config' file.
  const mockDir = envDetails?.RELATIVE_MOCK_DIR_FROM_REACT_TESTS_DIR || './';
  const header = [
    `/* eslint-disable */`,
    ``,
    `import React from 'react';`,
    `import {`,
    `  cleanup,`,
    `  fireEvent,`,
    `  render,`,
    `  queryByAttribute,`,
    `  getByText,`,
    `  waitFor,`,
    `} from '@testing-library/react';`,
    `import { initiateJestFetch } from 'ftmocks-utils';`,
    `import '@testing-library/jest-dom';`,
    `import App from '${REACT_APP_FROM_TESTS_DIR}';`,
    ``,
    `const ftmocksConifg = {`,
    `  MOCK_DIR: '${mockDir}',`,
    `};`,
    ``,
    `const getById = queryByAttribute.bind(null, 'id');`,
    `// Recorded selectors are a mix of XPath and CSS; resolve both.`,
    `const getByXPath = (container, selector) => {`,
    `  if (typeof selector === 'string' && /^\\(?\\//.test(selector)) {`,
    `    const iterator = document.evaluate(`,
    `      selector,`,
    `      container,`,
    `      null,`,
    `      XPathResult.FIRST_ORDERED_NODE_TYPE,`,
    `      null`,
    `    );`,
    `    return iterator.singleNodeValue;`,
    `  }`,
    `  try {`,
    `    return container.querySelector(selector);`,
    `  } catch {`,
    `    return null;`,
    `  }`,
    `};`,
    `jest.setTimeout(60000);`,
    ``,
    `afterEach(cleanup);`,
    ``,
  ].join('\n');

  const testBlock = [
    `// ${testName} test case`,
    `it(${jsStringLiteral(testName)}, async () => {`,
    `  await initiateJestFetch(jest, ftmocksConifg, ${jsStringLiteral(testName)});`,
    `  const dom = render(<App />);`,
    body,
    `});`,
    ``,
  ].join('\n');

  return `${header}\n${testBlock}`;
}

export function generateAngularCode(
  actions,
  tests = [],
  selectedTest,
  envDetails
) {
  const testName = selectedTest?.name || 'Recorded test';

  const body = (actions || [])
    .map((action) => {
      switch (action.type) {
        case 'click':
          return [
            ``,
            `    {`,
            `      const el = getByXPath(fixture.nativeElement, ${jsStringLiteral(action.target)});`,
            `      el && el.dispatchEvent(new MouseEvent('click', { bubbles: true }));`,
            `      fixture.detectChanges();`,
            `      await fixture.whenStable();`,
            `      fixture.detectChanges();`,
            `    }`,
          ].join('\n');
        case 'type':
        case 'change':
        case 'input':
          return [
            ``,
            `    {`,
            `      const el = getByXPath(fixture.nativeElement, ${jsStringLiteral(action.target)});`,
            `      if (el) {`,
            `        el.value = ${jsStringLiteral(action.value)};`,
            `        el.dispatchEvent(new Event('input', { bubbles: true }));`,
            `        el.dispatchEvent(new Event('change', { bubbles: true }));`,
            `        fixture.detectChanges();`,
            `      }`,
            `    }`,
          ].join('\n');
        case 'dblclick':
          return [
            ``,
            `    {`,
            `      const el = getByXPath(fixture.nativeElement, ${jsStringLiteral(action.target)});`,
            `      el && el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));`,
            `      fixture.detectChanges();`,
            `    }`,
          ].join('\n');
        case 'contextmenu':
          return [
            ``,
            `    {`,
            `      const el = getByXPath(fixture.nativeElement, ${jsStringLiteral(action.target)});`,
            `      el && el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));`,
            `      fixture.detectChanges();`,
            `    }`,
          ].join('\n');
        default:
          return null;
      }
    })
    .filter((cd) => !!cd)
    .join('\n');

  // ftmocks config is inlined below rather than imported from a separate
  // './test-config' file.
  const mockDir = envDetails?.RELATIVE_MOCK_DIR_FROM_ANGULAR_TESTS_DIR || './';
  const header = [
    `/* eslint-disable */`,
    ``,
    `import { ComponentFixture, TestBed } from '@angular/core/testing';`,
    `import {`,
    `  HttpErrorResponse,`,
    `  HttpResponse,`,
    `  provideHttpClient,`,
    `  withInterceptors,`,
    `} from '@angular/common/http';`,
    `import { provideNoopAnimations } from '@angular/platform-browser/animations';`,
    `import { of, throwError } from 'rxjs';`,
    `import { ftmocksHttpInterceptor, getByXPath } from 'ftmocks-utils';`,
    `import { AppComponent } from '../app.component';`,
    ``,
    `const ftmocksConifg = {`,
    `  MOCK_DIR: '${mockDir}',`,
    `};`,
    ``,
    `jest.setTimeout(60000);`,
    ``,
  ].join('\n');

  const testBlock = [
    `describe(${jsStringLiteral(testName)}, () => {`,
    `  it(${jsStringLiteral(testName)}, async () => {`,
    `    await TestBed.configureTestingModule({`,
    `      imports: [AppComponent],`,
    `      providers: [`,
    `        provideHttpClient(`,
    `          withInterceptors([`,
    `            ftmocksHttpInterceptor(ftmocksConifg, ${jsStringLiteral(testName)}, {`,
    `              HttpResponse,`,
    `              HttpErrorResponse,`,
    `              of,`,
    `              throwError,`,
    `            }),`,
    `          ])`,
    `        ),`,
    `        provideNoopAnimations(),`,
    `      ],`,
    `    }).compileComponents();`,
    ``,
    `    const fixture: ComponentFixture<AppComponent> =`,
    `      TestBed.createComponent(AppComponent);`,
    `    fixture.detectChanges();`,
    `    await fixture.whenStable();`,
    `    fixture.detectChanges();`,
    body,
    `  });`,
    `});`,
    ``,
  ].join('\n');

  return `${header}\n${testBlock}`;
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
    return action?.target;
  };

  const getNth = (action, selector) => {
    return action?.selectors?.find((s) => s.value === selector)?.nth || 1;
  };

  Object.keys(testActions).forEach((testName) => {
    let testCode = testActions[testName].actions
      .filter(
        (action, index) =>
          (action.target || action.type === 'waitForTimeout') &&
          (action.type !== 'input' ||
            (action.type === 'input' &&
              testActions[testName].actions?.[index + 1]?.type !== 'input'))
      )
      .map((action) => {
        let locator = getLocator(action);
        if (locator && (locator.startsWith('/') || locator.startsWith('(/'))) {
          locator = `xpath=${locator}`;
        }
        const nth = locator ? getNth(action, locator) - 1 : 0;
        const loc = jsStringLiteral(locator);
        const val = jsStringLiteral(action.value);
        const key = jsStringLiteral(action.key);
        const elementType = action.element?.type;
        switch (action.type) {
          case 'click':
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).click();`;
            }
            return `  await page.locator(${loc}).click();`;
          case 'type':
            if (elementType === 'input') {
              if (nth > 0) {
                return `  await page.locator(${loc}).nth(${nth}).fill(${val});`;
              }
              return `  await page.locator(${loc}).fill(${val});`;
            }
            if (elementType === 'textarea') {
              if (nth > 0) {
                return `  await page.locator(${loc}).nth(${nth}).fill(${val});`;
              }
              return `  await page.locator(${loc}).fill(${val});`;
            }
            if (elementType === 'select') {
              if (nth > 0) {
                return `  await page.locator(${loc}).nth(${nth}).selectOption(${val});`;
              }
              return `  await page.locator(${loc}).selectOption(${val});`;
            }
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).fill(${val});`;
            }
            return `  await page.locator(${loc}).fill(${val});`;
          case 'input':
            if (elementType === 'input') {
              if (nth > 0) {
                return `  await page.locator(${loc}).nth(${nth}).fill(${val});`;
              }
              return `  await page.locator(${loc}).fill(${val});`;
            }
            if (elementType === 'textarea') {
              if (nth > 0) {
                return `  await page.locator(${loc}).nth(${nth}).fill(${val});`;
              }
              return `  await page.locator(${loc}).fill(${val});`;
            }
            if (elementType === 'select') {
              if (nth > 0) {
                return `  await page.locator(${loc}).nth(${nth}).selectOption(${val});`;
              }
              return `  await page.locator(${loc}).selectOption(${val});`;
            }
            if (elementType === 'checkbox') {
              return '';
            }
            if (elementType === 'radio') {
              return '';
            }
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).fill(${val});`;
            }
            return `  await page.locator(${loc}).fill(${val});`;
          case 'change':
            if (elementType === 'input') {
              if (nth > 0) {
                return `  await page.locator(${loc}).nth(${nth}).fill(${val});`;
              }
              return `  await page.locator(${loc}).fill(${val});`;
            }
            // TODO: Handle change event for select
            return '';
          case 'dblclick':
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).dblclick();`;
            }
            return `  await page.locator(${loc}).dblclick();`;
          case 'contextmenu':
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).click({ button: 'right' });`;
            }
            return `  await page.locator(${loc}).click({ button: 'right' });`;
          case 'popstate-url':
            return `  await page.goBack();`;
          case 'hover':
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).hover();`;
            }
            return `  await page.locator(${loc}).hover();`;
          case 'keydown':
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).keyboard.down(${key});`;
            }
            return `  await page.keyboard.down(${key});`;
          case 'keyup':
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).keyboard.up(${key});`;
            }
            return `  await page.keyboard.up(${key});`;
          case 'keypress':
            if (nth > 0) {
              return `  await page.locator(${loc}).nth(${nth}).keyboard.press(${key});`;
            }
            return `  await page.keyboard.press(${key});`;
          case 'waitForTimeout':
            // action.value is expected to be the timeout in ms
            if (action.value && !isNaN(action.value)) {
              return `  await page.waitForTimeout(${action.value});`;
            }
            return '';
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

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      `  await page.goto(${jsStringLiteral(url)});`,
      testCode,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generatePlaywrightCodeForMockMode(
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
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    let testCode = [
      `// ${selectedTest?.name || testName} test case in mock mode`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes, injectEventRecordingScript } from 'ftmocks-utils';

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await test.setTimeout(360000);`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      `  await page.goto(${jsStringLiteral(url)});`,
      `  await page.waitForTimeout(360000);`,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generatePlaywrightCodeForEventsMockMode(
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
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    let testCode = [
      `// ${selectedTest?.name || testName} test case in mock mode`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes, injectEventRecordingScript } from 'ftmocks-utils';

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await test.setTimeout(360000);`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      ` await injectEventRecordingScript(
        page,
        '${url}',
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      `  await page.goto(${jsStringLiteral(url)});`,
      `  await page.waitForTimeout(360000);`,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generatePlaywrightCodeForContinueEventsMockMode(
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
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    let testCode = [
      `// ${selectedTest?.name || testName} test case in mock mode`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes, injectEventRecordingScript } from 'ftmocks-utils';

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await test.setTimeout(360000);`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      ` await injectEventRecordingScript(
        page,
        '${url}',
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)},
        true
      );`,
      `  await page.goto(${jsStringLiteral(url)});`,
      `  await page.waitForTimeout(360000);`,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generatePlaywrightCodeForRunEvents(
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
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    let testCode = [
      `// ${selectedTest?.name || testName} test case in mock mode`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes, runEventsForTest } from 'ftmocks-utils';

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await test.setTimeout(360000);`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      ` await runEventsForTest(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      `  await page.waitForTimeout(2000);`,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generatePlaywrightCodeForRunEventsInPresentationMode(
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
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    let testCode = [
      `// ${selectedTest?.name || testName} test case in mock mode`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes, runEventsInPresentationMode } from 'ftmocks-utils';

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await test.setTimeout(360000);`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      ` await runEventsInPresentationMode(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      `  await page.waitForTimeout(360000);`,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generatePlaywrightCodeForRunEventsInTrainingMode(
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
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    let testCode = [
      `// ${selectedTest?.name || testName} test case in mock mode`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes, runEventsInTrainingMode } from 'ftmocks-utils';

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await test.setTimeout(360000);`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      ` await runEventsInTrainingMode(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      `  await page.waitForTimeout(360000);`,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generatePlaywrightCodeForRunEventsForScreenshots(
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
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    let testCode = [
      `// ${selectedTest?.name || testName} test case in mock mode`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes, runEventsForScreenshots } from 'ftmocks-utils';

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await test.setTimeout(360000);`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      ` await runEventsForScreenshots(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      `  await page.waitForTimeout(360000);`,
      `  await page.close();`,
      `});`,
      ``,
    ].join('\n');
    testCodes.push(testCode);
  });

  return testCodes.join('\n');
}

export function generatePlaywrightCodeForRunEventsForHealingSelectors(
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
    const url =
      testActions[testName].actions[0]?.type === 'url'
        ? testActions[testName].actions[0].value
        : 'http://your-app-url';

    let testCode = [
      `// ${selectedTest?.name || testName} test case in mock mode`,
      `import { test, expect } from '@playwright/test';
import { initiatePlaywrightRoutes, runEventsForHealingSelectors } from 'ftmocks-utils';

test(${jsStringLiteral(selectedTest?.name || testName)}, async ({ page }) => {`,
      ` await test.setTimeout(360000);`,
      ` await initiatePlaywrightRoutes(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      ` await runEventsForHealingSelectors(
        page,
        {
          MOCK_DIR: '${envDetails.RELATIVE_MOCK_DIR_FROM_PLAYWRIGHT_DIR || './ftmocks'}',
          FALLBACK_DIR: '${envDetails.RELATIVE_FALLBACK_DIR_FROM_PLAYWRIGHT_DIR || './public'}',
        },
        ${jsStringLiteral(selectedTest.name)}
      );`,
      `  await page.waitForTimeout(360000);`,
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
