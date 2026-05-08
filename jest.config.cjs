module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.(js|ts|tsx)",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(lucide-react|sonner)/)",
  ],
  coverageProvider: "v8",
  coverageDirectory: "coverage",
  coverageReporters: ["text", "html", "lcov"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js}",
    "!src/**/__tests__/**",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/mocks/**",
  ],
};
