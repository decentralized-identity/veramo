/**
 * Global type definitions for Playwright integration with Jest
 * 
 * This file provides TypeScript support for the global browser objects
 * that are made available by the jest-playwright-setup.js file.
 */

import type { Browser, BrowserContext, Page } from 'playwright';

declare global {
  /**
   * Global page object provided by Playwright setup
   */
  var page: Page;
  
  /**
   * Global browser object provided by Playwright setup
   */
  var browser: Browser;
  
  /**
   * Global browser context object provided by Playwright setup
   */
  var context: BrowserContext;
}

export {};