module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  // extends: 'airbnb-base',
  // required to lint *.wpy files
  plugins: [
    'html'
  ],
  globals: {
    // 小程序特有
    "getApp": true
  },
  settings: {
    'html/html-extensions': ['.html', '.wpy']
  },
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'space-before-function-paren': 0,
    // 小程序特有
    'class-methods-use-this': 0,
    'no-extra-semi': 2,
    'semi': [2, 'never'], // 不能加没有必要的分号，除非以[、(、/、+、-这5种情况开头的语句
    'comma-dangle': [2, 'never'], // 对象或数组最后一项后不能加逗号
    'curly': 'error', // 条件或循环语句即使只有一句，也要加{}
    'import/extensions': 0,
    'import/no-unresolved': 0
  }
}
