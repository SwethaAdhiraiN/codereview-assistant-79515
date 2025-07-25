import { render, screen } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
test('renders the Results header', () => {
  render(<App />);
  // The Results header (for current analysis tab) is always present in the default UI.
  const headerElement = screen.getByRole('heading', { name: /results/i });
  expect(headerElement).toBeInTheDocument();
});
