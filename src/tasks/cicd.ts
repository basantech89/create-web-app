import { writeToRoot } from 'utils'

const cicd = async () => {
	const cicdTool = global.cicd
	const isPrivateProject = global.privateProject

	if (cicdTool === 'github-actions') {
		writeToRoot(
			'.github/workflows/build.yml',
			`
        name: Build
        on: pull_request

        jobs:
          build:
            name: Build
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@master
              - name: Setup Node.js
                uses: actions/setup-node@v2
                with:
                  node-version: 'lts/*'
              - name: Dependencies Installation
                run: yarn install
              - name: Build
                run: yarn build
              - name: Test
                run: yarn test
              - name: Codecov Upload
                uses: codecov/codecov-action@v3
                with:
                  ${
										isPrivateProject
											? 'token: ${{ secrets.CODECOV_TOKEN }} # not required for public repos'
											: ''
									}
                  files: ./coverage/lcov.info # optional
                  flags: unittests # optional
                  name: codecov-umbrella # optional
                  fail_ci_if_error: true # optional (default = false)
                  verbose: true # optional (default = false)
              - name: Send coverage to Code Climate
                uses: paambaati/codeclimate-action@v3.0.0
                env:
                  CC_TEST_REPORTER_ID: \${{ secrets.CC_TEST_REPORTER_ID }}
                with:
                  debug: true
                  coverageCommand: yarn test
                  coverageLocations: |
                    \${{github.workspace}}/coverage/lcov.info:lcov
      `
		)
	}
}

export default cicd