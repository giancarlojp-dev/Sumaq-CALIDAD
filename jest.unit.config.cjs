/** @type {import('jest').Config} */
const config = {
preset: "ts-jest",
testEnvironment: "node",
roots: ["<rootDir>/tests/unit"],
moduleNameMapper: {
"^@/(.*)$": "<rootDir>/src/$1",
},
collectCoverageFrom: [
"src/lib/cobranzas/**/*.ts",
"src/services/cobranzas/**/*.ts",
"!src/services/cobranzas/tipos.ts",
"!src/services/cobranzas/contexto.ts",
],
coverageThreshold: {
global: {
  branches: 80,
  functions: 80,
  lines: 80,
  statements: 80,
},
},
};

module.exports = config;
