import '@testing-library/jest-dom/vitest';

process.env.NODE_ENV = 'test';

// Optional: mock localStorage if needed by components under test
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });
