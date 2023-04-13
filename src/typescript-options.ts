import { ScopedPackagesOptions } from 'projen/lib/javascript'
import { TypeScriptProject } from 'projen/lib/typescript'

export type TwinDigitalTypeScriptOptions = {
  additionalScopedPackages?: ScopedPackagesOptions[]
  defaultReleaseBranch?: string

  /**
   * References to TypescriptProjects in the same monorepo. This will add the reference as a dependency,
   * and include it in the tsconfig references as well.
   *
   * @default - []
   */
  references?: TypeScriptProject[]
}
