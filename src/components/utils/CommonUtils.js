const areJsonEqual = (jsonObj1, jsonObj2) => {
  // Check if both are objects and not null
  if (
    typeof jsonObj1 === 'object' &&
    jsonObj1 !== null &&
    typeof jsonObj2 === 'object' &&
    jsonObj2 !== null
  ) {
    // Get the keys of both objects
    const keys1 = Object.keys(jsonObj1).filter((key) => jsonObj1[key] !== null);
    const keys2 = Object.keys(jsonObj2).filter((key) => jsonObj1[key] !== null);

    // Check if the number of keys is different
    if (keys1.length !== keys2.length) {
      return false;
    }

    // Recursively check each key-value pair
    for (let key of keys1) {
      if (!keys2.includes(key) || !areJsonEqual(jsonObj1[key], jsonObj2[key])) {
        return false;
      }
    }

    return true;
  } else {
    // For non-object types, use strict equality comparison
    return jsonObj1 === jsonObj2;
  }
};

const compareURL = (url1, url2, ignoreParams) => {
  // If ignoreParams is not provided or empty, do direct string comparison
  if (!ignoreParams || ignoreParams.length === 0) {
    return url1 === url2;
  }

  try {
    // Parse URLs into URL objects
    const parsedUrl1 = new URL(
      url1.startsWith('http') ? url1 : `http://dummy.com${url1}`
    );
    const parsedUrl2 = new URL(
      url2.startsWith('http') ? url2 : `http://dummy.com${url2}`
    );

    // Compare pathname first
    if (parsedUrl1.pathname !== parsedUrl2.pathname) {
      return false;
    }

    // Get search params
    const params1 = new URLSearchParams(parsedUrl1.search);
    const params2 = new URLSearchParams(parsedUrl2.search);

    // Convert to objects for easier comparison
    const paramsObj1 = {};
    const paramsObj2 = {};

    for (const [key, value] of params1.entries()) {
      if (!ignoreParams.includes(key)) {
        paramsObj1[key] = value;
      }
    }

    for (const [key, value] of params2.entries()) {
      if (!ignoreParams.includes(key)) {
        paramsObj2[key] = value;
      }
    }

    return areJsonEqual(paramsObj1, paramsObj2);
  } catch (error) {
    console.error('Error comparing URLs:', error);
    return false;
  }
};

const isSameRequest = (req1, req2) => {
  try {
    let matched = true;
    if (!compareURL(req1.url, req2.url, req1.ignoreParams)) {
      matched = false;
      // console.log('not matched at url', req1.method, req2.method);
    } else if (req1.method !== req2.method) {
      matched = false;
      // console.log('not matched at method', req1.method, req2.method);
    } else if (
      (!req1.postData &&
        req2.postData &&
        req1.method.toUpperCase() !== 'GET') ||
      (req1.postData && !req2.postData && req1.method.toUpperCase() !== 'GET')
    ) {
      matched = areJsonEqual(req1.postData || {}, req2.postData || {});
      // console.log('not matched at post Data 0', req1.postData, req2.postData);
    } else if (
      req1.postData &&
      req2.postData &&
      !areJsonEqual(req1.postData, req2.postData)
    ) {
      // console.log('not matched at post Data 1', req1.postData, req2.postData);
      console.log('--------start-----------');
      console.log(req1.postData);
      console.log('-------------------');
      console.log(req2.postData);
      console.log('--------end-----------');
      matched = false;
    }
    return matched;
  } catch (error) {
    console.error(error);
    console.log(req1, req2);
    return false;
  }
};

const isSameResponse = (req1, req2) => {
  try {
    let matched = true;
    if (req1.response.status !== req2.response.status) {
      matched = false;
      // console.log('not matched at url', req1.method, req2.method);
    } else if (
      (!req1.response.content && req2.response.content) ||
      (req1.response.content && !req2.response.content)
    ) {
      matched = areJsonEqual(
        JSON.parse(req1.response.content) || {},
        JSON.parse(req2.response.content) || {}
      );
      // console.log('not matched at post Data 0', req1.postData, req2.postData);
    } else if (
      req1.response.content &&
      req2.response.content &&
      !areJsonEqual(
        JSON.parse(req1.response.content) || {},
        JSON.parse(req2.response.content) || {}
      )
    ) {
      matched = false;
    }
    if (matched) {
      console.log('matched responses', req1, req2);
    }
    return matched;
  } catch (error) {
    console.error(error);
    console.log(req1, req2);
    return false;
  }
};

export const compareMockToMock = (mock1, mock2, matchResponse) => {
  try {
    if (matchResponse) {
      return isSameRequest(mock1, mock2) && isSameResponse(mock1, mock2);
    } else {
      return isSameRequest(mock1, mock2);
    }
  } catch (error) {
    console.error(error);
    console.log(mock1, mock2, matchResponse);
    return false;
  }
};

export const markDuplicateMocks = (mocks) => {
  mocks.forEach((mock) => {
    const duplicateMocks = mocks.filter((m) => compareMockToMock(mock, m));
    if (duplicateMocks.length > 1) {
      mock.isDuplicate = true;
    }
  });
  return mocks;
};

export const getDuplicateMocks = (mocks, mockItem) => {
  const duplicates = [];
  mocks.forEach((mock) => {
    if (mock.id !== mockItem.id && compareMockToMock(mock, mockItem)) {
      duplicates.push(mock);
    }
  });
  return duplicates;
};

export const isMockInDefaultMocks = (defaultMocks, mockItem) => {
  return defaultMocks.find((mock) => compareMockToMock(mock, mockItem));
};
