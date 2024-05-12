/** @type {import('prettier').config} PrettierConfig */

/** @type { PrettierConfig } */
const config = {
    plugins: ["prettier-plugin-tailwindcss"],
    printWidth: 80,
    tabWidth: 7,
    useTabs: false,
    semi: false,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,
    trailingComma: 'es5',
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'auto',
    bracketSameLine: false,
}

export default config