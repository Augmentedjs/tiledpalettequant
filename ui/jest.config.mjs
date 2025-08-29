export default {
  preset: "ts-jest/presets/default-esm", // Ensure TS and ES modules are supported
  testEnvironment: "jsdom", // Required for React Testing Library
  extensionsToTreatAsEsm: [".ts", ".tsx"], // Treat TypeScript files as ES modules
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }] // Use ts-jest to transform TypeScript files
  },
  setupFilesAfterEnv: ["./jest.setup.ts"], // Your setup file
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy" // Mock CSS modules
  }
};
