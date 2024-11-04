import { render, screen } from '@testing-library/react';
import FtMocksTool from './FtMocksTool';

test('renders learn react link', () => {
  render(<FtMocksTool />);
  const linkElement = screen.getByText(/Sitemark/i);
  expect(linkElement).toBeInTheDocument();
});
