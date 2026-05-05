module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
  transformIgnorePatterns: [
    "/node_modules/(?!@faker-js/faker)"
  ],
  detectOpenHandles: true,
  forceExit: true,
  verbose: true,
  reporters: [
    'default',
 [
  'jest-junit',
   {
     outputDirectory: './test-results',
     outputName: 'junit.xml',
     classNameTemplate: '{classname}',
     titleTemplate: '{title}',
   }
  ]
  ]
};