import { writeToRoot } from '../../../utils'

const setupTestUtils = (useEslint: boolean) => {
	writeToRoot(
		'test-utils/jest-common.ts',
		`
      import { Config } from '@jest/types'
      import path from 'path'

      const config: Config.InitialOptions = {
        rootDir: path.join(__dirname, '../'),
        moduleDirectories: ['node_modules', path.join(__dirname, '..'), __dirname],
        modulePathIgnorePatterns: ['dist'],
        watchPlugins: [
          'jest-watch-select-projects',
          'jest-watch-typeahead/filename',
          'jest-watch-typeahead/testname',
          'jest-runner-eslint/watch-fix'
        ]
      }

      module.exports = config
    `
	)

	writeToRoot(
		'test-utils/jest-client.ts',
		`
      import { Config } from '@jest/types'
      import path from 'path'

      const config: Config.InitialOptions = {
        ...require('./jest-common'),
        displayName: 'client',
        testEnvironment: 'jest-environment-jsdom',
        testMatch: [
          '**/__tests__/**/*.[jt]s?(x)',
          '**/?(*.)+(spec|test).[jt]s?(x)',
          '!**/utils/__tests__/*.(ts|tsx)'
        ],
        moduleNameMapper: {
          '\\.(css|scss)$': require.resolve('./style-mock.ts')
        },
        setupFilesAfterEnv: ['<rootDir>/test-utils/setupTests.ts'],
        coverageDirectory: path.join(__dirname, '../coverage/client')
      }

      module.exports = config
    `
	)

	writeToRoot(
		'test-utils/jest-utils.ts',
		`
      import { Config } from '@jest/types'
      import path from 'path'

      const config: Config.InitialOptions = {
        ...require('./jest-common'),
        displayName: 'utils',
        testEnvironment: 'jest-environment-node',
        testMatch: ['**/utils/__tests__/*.(ts|tsx)'],
        coverageDirectory: path.join(__dirname, '../coverage/utils')
      }

      module.exports = config
    `
	)

	writeToRoot(
		'test-utils/jest-lint.ts',
		`
      import { Config } from '@jest/types'

      const config: Config.InitialOptions = {
        ...require('./jest-common'),
        displayName: 'lint',
        runner: 'jest-runner-eslint',
        testMatch: ['<rootDir>/**/*.[jt]s?(x)']
      }

      module.exports = config
    `
	)

	writeToRoot(
		'test-utils/setupTests.ts',
		`
      import '@testing-library/jest-dom/extend-expect'
      import 'jest-axe/extend-expect'
      import 'whatwg-fetch'

      import { server } from '../mocks/server'

      // Establish API mocking before all tests.
      beforeAll(() => server.listen())

      // Reset any request handlers that we may add during the tests,
      // so they don't affect other tests.
      afterEach(() => server.resetHandlers())

      // Clean up after the tests are finished.
      afterAll(() => server.close())
    `
	)

	writeToRoot(
		'test-utils/index.tsx',
		`
      import store from '../redux-store'

      import { render as rtlRender, RenderOptions } from '@testing-library/react'
      import React, { FC, ReactElement } from 'react'
      import { Provider } from 'react-redux'
      import { MemoryRouter } from 'react-router-dom'
      import { RecoilRoot } from 'recoil'

      const render = (
        ui: ReactElement,
        options?: Omit<RenderOptions, 'wrapper'> & { route?: string }
      ) => {
        const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
          return (
            <Provider store={store}>
              <RecoilRoot>
                <MemoryRouter initialEntries={[options?.route || '/']}>{children}</MemoryRouter>
              </RecoilRoot>
            </Provider>
          )
        }

        return rtlRender(ui, { wrapper: AllTheProviders, ...options })
      }

      export * from '@testing-library/react'
      export default render
    `
	)

	writeToRoot(
		'jest.config.ts',
		`
      import { Config } from '@jest/types'

      const config: Config.InitialOptions = {
        ...require('./src/test-utils/jest-common.ts'),
        collectCoverageFrom: ['**/src/**/*.{ts|tsx}'],
        coverageThreshold: {
          global: {
            statements: 55,
            branches: 25,
            functions: 80,
            lines: 55
          },
          './src/utils/*.(ts|tsx)': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100
          }
        },
        projects: [
          '<rootDir>/test-utils/jest.client.ts',
          '<rootDir>/test-utils/jest.utils.ts',
          '<rootDir>/test-utils/jest.lint.ts'
        ]
      }

      module.exports = config
    `
	)

	if (useEslint) {
		writeToRoot(
			'jest-runner-eslint.config.ts',
			`
        export default {
        cliOptions: {
          ignorePath: './.gitignore',
          cache: true
          }
        }
    `
		)
	}
}

export default setupTestUtils
