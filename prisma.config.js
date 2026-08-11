try {
  require("dotenv").config();
} catch (e) {
  // dotenv might not be installed in production
}
const { defineConfig } = require("prisma/config");
const path = require("path");

console.log("=== Loading prisma.config.js ===");
console.log("DATABASE_URL in config:", process.env.DATABASE_URL);

module.exports = defineConfig({
  schema: path.join(__dirname, "apps/backend/prisma/schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
