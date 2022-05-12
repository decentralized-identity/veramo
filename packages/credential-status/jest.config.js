module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!**/types/**', '!**/build/**', '!**/node_modules/**'],
  coverageReporters: ['text', 'lcov', 'json'],
  coverageDirectory: './coverage',
  transform: {
    '\\.jsx?$': 'babel-jest',
    '\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!credential-status/)'],
  testMatch: ['**/__tests__/**/*.test.*'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
  testEnvironment: 'node',
  automock: false
}
