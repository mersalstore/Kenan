require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { defineConfig } = require("prisma/config");
const path = require("path");

module.exports = defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/kanan?schema=public",
  },
});
