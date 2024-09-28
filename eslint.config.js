
export default [
  {
    files: ["**/*.js"],
    rules: {
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "no-unused-vars": "warn"
    },
    languageOptions: {
      "ecmaVersion": 12,
      "sourceType": "module"
    }
  }
];
