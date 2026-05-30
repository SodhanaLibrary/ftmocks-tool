const getQueryParams = (url) => {
  const params = new URL(url).searchParams;
  return Array.from(params.entries()).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
};

const countMatchingParams = (baseParams, compareParams) => {
  return Object.keys(baseParams).reduce((count, key) => {
    return count + (baseParams[key] === compareParams[key] ? 1 : 0);
  }, 0);
};

const isValidUrl = (url) => {
  try {
    new URL(url); // If this works, URL format is valid
    return true;
  } catch (_) {
    return false; // If it throws, URL format is invalid
  }
};

const getValidUrl = (url) => {
  if (!isValidUrl(url)) {
    return `http://something/${url}`;
  }
  return url;
};

export const sortUrlsByMatch = (url, mockData) => {
  const searchTerm = String(url ?? '').toLowerCase();
  const items = mockData ?? [];

  if (!searchTerm) {
    return items;
  }

  if (searchTerm.split('/').length === 1 && searchTerm.split('?').length === 1) {
    return items.filter((mockItem) => {
      const mockUrl = String(mockItem?.url ?? '').toLowerCase();
      const mockContent = String(mockItem?.response?.content ?? '').toLowerCase();
      return (
        mockUrl.includes(searchTerm) || mockContent.includes(searchTerm)
      );
    });
  }
  const baseUrl = new URL(getValidUrl(url));
  const baseParams = getQueryParams(getValidUrl(url));
  const basePathname = baseUrl.pathname;

  // Map each URL in urlList to an object with the URL, match count, and pathname match
  const urlMatchCounts = items.map((mockItem) => {
    if (!mockItem?.url) {
      return { url: '', matches: 0, pathnameMatch: 0, mockItem };
    }
    const compareUrl = new URL(getValidUrl(mockItem.url));
    const compareParams = getQueryParams(getValidUrl(mockItem.url));
    const matchCount = countMatchingParams(baseParams, compareParams);

    // Check if pathnames match
    const pathnameMatch = basePathname === compareUrl.pathname ? 1 : 0;

    return { url: mockItem.url, matches: matchCount, pathnameMatch, mockItem };
  });

  // Sort by pathname match first, then by query parameter matches in descending order
  urlMatchCounts.sort((a, b) => {
    if (b.pathnameMatch !== a.pathnameMatch) {
      return b.pathnameMatch - a.pathnameMatch;
    }
    return b.matches - a.matches;
  });

  // Return the sorted URLs
  return urlMatchCounts.map((item) => item.mockItem);
};
