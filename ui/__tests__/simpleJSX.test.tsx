import { render, screen } from '@testing-library/react';
import React from 'react';

const App = () => <h1>Hello, world!</h1>;

test('renders the correct content', () => {
  render(<App />);
  expect(screen.getByText('Hello, world!')).toBeInTheDocument();
});
