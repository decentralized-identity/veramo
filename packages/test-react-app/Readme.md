# test-react-app

This package is used as a testing ground to check the compatibility of Veramo core dependencies with a browser environment. It runs the same shared test suites that are used in Node.js environments but executes them in a real browser using Playwright.

## Overview

The test-react-app package serves two main purposes:
1. **Browser Compatibility Testing**: Validates that Veramo works correctly in browser environments
2. **Integration Testing**: Runs comprehensive test suites including DID resolution, credential operations, and messaging

## Browser Testing Setup

### Migration from Puppeteer to Playwright

As of version 6.0.0, this package has been migrated from Puppeteer to Playwright for improved reliability and modern testing capabilities.

**Key Changes:**
- Browser automation now uses Playwright instead of Puppeteer
- The same test functionality and compatibility are maintained
- Enhanced debugging capabilities with traces, screenshots, and videos
- Improved CI reliability with better retry mechanisms

### Test Execution

#### Standard Test Execution
```bash
# Run all browser tests (headless mode)
pnpm test:browser
```

#### Debugging Options
```bash
# Run tests with visible browser window
HEADED=true pnpm test:browser

# Run with verbose output for debugging
DEBUG=pw:* pnpm test:browser

# Run specific test file
pnpm test:browser --testNamePattern="browserAgent"
```

### Test Architecture

The browser testing setup uses a hybrid approach:
- **Jest**: Test runner and framework for organizing tests
- **Playwright**: Browser automation and page interaction
- **React Dev Server**: Automatically started and managed by Playwright

#### Test Flow
1. Playwright starts the React development server automatically
2. Jest runs test files that use Playwright's browser automation
3. Tests interact with the React app running at `http://localhost:3000`
4. Shared test suites from `__tests__/shared/` execute in the browser environment
5. Server is automatically cleaned up after tests complete

### Configuration Files

- `playwright.config.ts`: Main Playwright configuration with browser settings
- `jest-integration.config.cjs`: Jest configuration for browser test integration
- `jest-playwright-setup.mjs`: Setup file that bridges Jest and Playwright

### Debugging Failed Tests

When tests fail, Playwright automatically captures:
- **Screenshots**: Saved to `test-results/` directory
- **Videos**: Recorded for failed tests only
- **Traces**: Detailed execution traces for retried tests

#### Viewing Debug Artifacts
```bash
# View trace files (interactive debugging)
npx playwright show-trace test-results/trace.zip

# Open test results in browser
npx playwright show-report
```
