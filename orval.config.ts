import { defineConfig } from "orval"

export default defineConfig({
  "agro-api": {
    input: {
      target: "./openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/api/generated/endpoints",
      schemas: "./src/api/generated/models",
      client: "fetch",
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
})
