export default {
    // The root of your source code, typically /src
    // `<rootDir>` is a token Jest substitutes
    roots: ["<rootDir>/src"],

    // Jest transformations -- this adds support for TypeScript
    // using ts-jest
    transform: {
        "^.+\\.tsx?$": ['babel-jest', { configFile: './babel.config.cjs' }], 
    },

    // Runs special logic, such as cleaning up components
    // when using React Testing Library and adds special
    // extended assertions to Jest
    setupFilesAfterEnv: [
        "<rootDir>/jest-setup.ts"
    ],

    // //ignore these directories for testing
    // testPathIgnorePatterns: [
    //     '/node_modules/', '/public/'
    // ],

    // Map all files ending with css or less, to the Mock
    // since otherwise jest would try to interpret css like js
    // and throw errors for unexpected tokens
    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/test/__mocks__/styleMock.js',
      },

    // Test spec file resolution pattern
    // Matches parent folder `__tests__` and filename
    // should contain `test` or `spec`.
    testMatch: ['<rootDir>/src/**/?(*.)test.{ts,tsx}'],

    // Module file extensions for importing
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

    
};