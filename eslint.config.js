import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            prettier: prettierPlugin,
        },
        settings: {
            react: { version: "detect" },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "prettier/prettier": "error",
        },
    },
    {
        ignores: ["dist/", "node_modules/", "src-tauri/"],
    },
);
