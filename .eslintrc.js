module.exports = {
    env: {
        'vue/setup-compiler-macros': true,
        browser: true,
        es2022: true,
        node: true,
        jest: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        'eslint-config-airbnb-base/whitespace',
        'airbnb-base/legacy',
        'airbnb-base',
        '@vue/eslint-config-typescript/recommended',
        'plugin:vue/vue3-recommended',
        'plugin:import/recommended',
        'prettier'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    plugins: ['vue', 'import'],
    rules: {
        'comma-dangle': 'off',
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-param-reassign': [
            'error',
            {
                ignorePropertyModificationsFor: ['context', 'acc', 'curr', '_state', '_store', '_app'], // The _app is for Vue 3 app plugins
                props: true
            }
        ],
        'no-tabs': ['error'],
        'no-underscore-dangle': ['error', { allow: ['_id'] }],
        'no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }
        ],
        'vue/html-indent': ['error', 4],
        indent: ['error', 4, { SwitchCase: 1 }]
    },
    ignorePatterns: ['**/*.min.js', '**/*.map', 'samples/**/*', 'temp/**/*', 'tmp/**/*'],
    settings: {
        'import/resolver': {
            jsconfig: {
                config: 'jsconfig.json',
                extensions: ['.js', '.ts', '.vue']
            }
        }
    }
};
