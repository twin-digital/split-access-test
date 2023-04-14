import path from 'node:path'
import { get, isEmpty } from 'lodash'
import { TypeScriptProject } from 'projen/lib/typescript'

const tsconfigOverride = (
  project: TypeScriptProject,
  key: string,
  value: any
) => {
  project.tsconfig?.file?.addOverride?.(key, value)
  project.tsconfigDev.file.addOverride(key, value)
}

/**
 * Updates a project's tsconfig for monorepo support, if it has a parent.
 */
export const updateTypescriptConfig = (project: TypeScriptProject) => {
  if (project.parent) {
    tsconfigOverride(project, 'compilerOptions.composite', true)
  }
}

export const addBaseTsconfigExtends = (project: TypeScriptProject) => {
  tsconfigOverride(project, 'compilerOptions.composite', true)

  const hasBaseTsconfig = get(project.parent, 'tsconfig') !== undefined
  if (project.parent && hasBaseTsconfig) {
    const pathToRoot = path.relative(project.outdir, project.parent.outdir)
    tsconfigOverride(project, 'extends', `${pathToRoot}/tsconfig.json`)
  }
}

/**
 * Adds tsconfig references (and corresponding paths) to a project.
 */
export const addReferences = (
  project: TypeScriptProject,
  references: TypeScriptProject[]
) => {
  // add project references as node dependencies and tsconfig references
  if (!isEmpty(references)) {
    project.addDeps(
      ...references.map((reference) => reference.package.packageName)
    )
    tsconfigOverride(
      project,
      'references',
      references.map((reference) => ({
        path: path.relative(project.outdir, reference.outdir),
      }))
    )

    // configure tsconfig path mappings for subprojects
    const tsconfigPathMappings = references.reduce(
      (result, reference) => ({
        ...result,
        [reference.package.packageName]: [
          `${path.join(
            path.relative(project.outdir, reference.outdir),
            reference.srcdir
          )}`,
        ],
      }),
      {} as Record<string, string[]>
    )

    tsconfigOverride(project, 'compilerOptions.paths', tsconfigPathMappings)

    if (project.deps.all.find((dep) => dep.name === 'ts-node')) {
      project.addDevDeps('tsconfig-paths')
      tsconfigOverride(project, 'ts-node.require', ['tsconfig-paths/register'])
    }
  }
}
