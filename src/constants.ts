import { javascript } from 'projen'

export const DEFAULTS = {
  authorEmail: 'sean@twindigital.io',
  authorName: 'Sean Kleinjung',
  cdkVersion: '2.73.0',
  constructsVersion: '10.1.309',
  defaultReleaseBranch: 'main',
  licensed: false,
  minNodeVersion: '16.18.1',
  packageManager: javascript.NodePackageManager.NPM,
  prettier: true,
}

export const DefaultCompilerOptions = {
  baseUrl: '.',
  noUnusedLocals: false,
  noUnusedParameters: false,
  skipLibCheck: true,
  target: 'ES2021',
}

export const DefaultPrettierOptions = {
  settings: {
    printWidth: 120,
    semi: false,
    singleQuote: true,
  },
}
