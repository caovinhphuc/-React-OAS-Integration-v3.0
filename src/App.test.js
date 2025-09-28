import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock store for testing
const mockStore = {
  getState: () => ({}),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
};

// Mock react-redux
jest.mock('react-redux', () => ({
  Provider: ({ children }) => children,
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => <div data-testid="route">{element}</div>,
  Link: ({ children, to }) => <a href={to} data-testid="link">{children}</a>,
  Navigate: () => <div data-testid="navigate">Navigate</div>,
  useLocation: () => ({ pathname: '/' }),
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  test('renders navigation', () => {
    render(<App />);
    expect(screen.getByText(/React OAS Integration v3.0/i)).toBeInTheDocument();
  });
});
