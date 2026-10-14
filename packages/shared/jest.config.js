/** Jest config for the platform-agnostic shared core. Runs on Linux/node. */
process.env.TZ = 'America/New_York'

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*.test.ts'],
}
