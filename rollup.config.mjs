import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";
import { externals } from "rollup-plugin-node-externals";
import pkg from "./package.json" assert { type: "json" };
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default defineConfig([
  {
    input: "index.ts",
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      del({ targets: "lib/*", verbose: true }),
      nodeResolve(),
      terser(),
      externals(),
      typescript({
        tsconfig: "./tsconfig.json",
        tsconfigOverride: {
          exclude: ["src"],
        },
      }),
    ],
  },
]);
