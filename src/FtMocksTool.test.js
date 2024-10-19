import { render, screen } from '@testing-library/react';
import MarketingPage from './MarketingPage';

test('renders learn react link', () => {
  render(<MarketingPage />);
  const linkElement = screen.getByText(/Sitemark/i);
  expect(linkElement).toBeInTheDocument();
});
