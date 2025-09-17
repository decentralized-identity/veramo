/**
 * Jest setup file for Playwright integration
 *
 * This file provides the bridge between Jest test runner and Playwright browser automation.
 * It maintains the same global API for compatibility with existing tests.
 */

import { chromium } from 'playwright'
import { exec, spawn } from 'child_process'
import { setTimeout } from 'timers/promises'
import { promisify } from 'util'

const execAsync = promisify(exec)

let browser
let page
let context
let serverProcess

// Helper function to check if server is running
async function isServerRunning(port = 3000) {
  try {
    const response = await fetch(`http://localhost:${port}`)
    return response.ok
  } catch {
    return false
  }
}

// Helper function to wait for server to be ready
async function waitForServer(port = 3000, timeout = 30000) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    if (await isServerRunning(port)) {
      return true
    }
    await setTimeout(1000) // Wait 1 second before checking again
  }
  throw new Error(`Server did not start within ${timeout}ms`)
}

// Global setup - runs before all tests
beforeAll(async () => {
  try {
    // Check if server is already running (for development)
    const serverAlreadyRunning = await isServerRunning(3000)
    const isCI = process.env.CI === 'true'

    if (!serverAlreadyRunning) {
      console.log('Starting React development server...')

      // Start the React development server
      serverProcess = spawn('pnpm', ['start'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          GENERATE_SOURCEMAP: 'false',
          BROWSER: 'none', // Prevent browser from opening
        },
        stdio: 'pipe', // Capture output
        detached: false, // Keep process attached for proper cleanup
      })

      // Handle server process events
      serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error)
      })

      serverProcess.on('exit', (code, signal) => {
        console.log(`Server process exited with code ${code} and signal ${signal}`)
      })

      // Ensure process cleanup on unexpected exit
      process.on('exit', () => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGKILL')
        }
      })

      process.on('SIGINT', () => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill('SIGKILL')
        }
        process.exit(0)
      })

      // Wait for server to be ready
      await waitForServer(3000, 30000)
      console.log('React development server is ready')
    } else {
      console.log('Using existing React development server')
    }

    // Launch browser with the same options as Playwright config
    // Support both CI and HEADED environment variables for controlling headless mode
    // Default to headless unless explicitly set to headed mode
    const isHeadless = process.env.HEADED !== 'true'

    console.log(
      `Launching browser in ${isHeadless ? 'headless' : 'headed'} mode (CI=${process.env.CI}, HEADED=${process.env.HEADED})`,
    )

    browser = await chromium.launch({
      headless: isHeadless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    // Create a new browser context
    context = await browser.newContext({
      // Set viewport to match typical desktop resolution
      viewport: { width: 1280, height: 720 },
      // Ignore HTTPS errors for local development
      ignoreHTTPSErrors: true,
    })

    // Create a new page
    page = await context.newPage()

    // Set up error handling for the page
    page.on('pageerror', (error) => {
      console.error('Page error:', error)
    })

    page.on('console', (msg) => {
      // Log console messages from the browser for debugging
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text())
      }
    })

    // Make page available globally for test compatibility
    global.page = page
    global.browser = browser
    global.context = context

    console.log('Playwright browser setup completed successfully')
  } catch (error) {
    console.error('Failed to set up Playwright browser:', error)
    throw error
  }
}, 60000) // 60 second timeout for server + browser setup

// Global teardown - runs after all tests
afterAll(async () => {
  try {
    if (page) {
      await page.close()
    }
    if (context) {
      await context.close()
    }
    if (browser) {
      await browser.close()
    }

    // Stop the server if we started it
    if (serverProcess && !serverProcess.killed) {
      console.log('Stopping React development server...')

      try {
        // Kill the entire process tree to ensure all child processes are terminated
        if (process.platform === 'win32') {
          // Windows
          await execAsync(`taskkill /pid ${serverProcess.pid} /T /F`)
        } else {
          // Unix-like systems (macOS, Linux)
          try {
            await execAsync(`pkill -P ${serverProcess.pid}`)
          } catch (pkillError) {
            // pkill might fail if no child processes, that's okay
            console.log('pkill command failed (this is normal if no child processes):', pkillError.message)
          }
          serverProcess.kill('SIGTERM')
        }

        // Wait a bit for graceful shutdown, longer in CI for stability
        const shutdownTimeout = process.env.CI ? 5000 : 2000
        await setTimeout(shutdownTimeout)

        // Force kill if still running
        if (!serverProcess.killed) {
          console.log('Force killing server process')
          serverProcess.kill('SIGKILL')
        }
      } catch (error) {
        console.log('Error killing server process, attempting direct kill:', error.message)
        try {
          serverProcess.kill('SIGKILL')
        } catch (killError) {
          console.log('Failed to kill server process:', killError.message)
        }
      }

      // Clean up references
      serverProcess = null
    }

    console.log('Playwright browser cleanup completed')
  } catch (error) {
    console.error('Error during browser cleanup:', error)
  }
}, 15000) // 15 second timeout for cleanup

// Setup for each test - ensure clean state
beforeEach(async () => {
  // Note: We don't navigate to the base URL here because the React app
  // tests handle their own navigation. This allows for more flexible testing.
})

// Cleanup after each test
afterEach(async () => {
  // Clear any console messages or errors
  // This helps with test isolation
  if (page) {
    try {
      // Clear any dialogs or alerts
      page.removeAllListeners('dialog')
    } catch (error) {
      // Ignore cleanup errors
    }
  }
})
