import { ScopedPackagesOptions } from 'projen/lib/javascript/index.js'
import { TypeScriptProject } from 'projen/lib/typescript/index.js'

export type TwinDigitalTypeScriptOptions = {
  additionalScopedPackages?: ScopedPackagesOptions[]
  defaultReleaseBranch?: string

  /**
   * Whether to configure this project as an ES module (package.json "type": "module"). If true, has the following effects:
   *
   * - Adds "type": "module" to package.json
   * - Adds "module": "node16" to tsconfig.json
   * - Adds "moduleResolution": "node16" to tsconfig.json
   *
   * @default true
   */
  esModule?: boolean

  /**
   * References to TypescriptProjects in the same monorepo. This will add the reference as a dependency,
   * and include it in the tsconfig references as well.
   *
   * @default - []
   */
  references?: TypeScriptProject[]
}
