import path from 'node:path'

import {
  TwinDigitalTypescriptProject,
  TwinDigitalTypescriptProjectOptions,
} from '@twin-digital/projen'
import { NodePackage, NodeProject } from 'projen/lib/javascript'

type AccessiblePackage = Omit<
  NodePackage,
  'installDependencies' | 'resolveDepsAndWritePackageJson'
> & {
  installDependencies: () => void
  resolveDepsAndWritePackageJson: () => boolean
}

/**
 * Helper to easily access the private methods 'installDependencies' and 'resolveDepsAndWritePackageJson'
 * on NodePackage.
 */
const exposePrivates = (pkg: NodePackage): AccessiblePackage =>
  pkg as unknown as AccessiblePackage

export class TwinDigitalMonorepoProject extends TwinDigitalTypescriptProject {
  constructor(options: TwinDigitalTypescriptProjectOptions) {
    super(options)

    // setup build steps that operate on child workspaces
    this.preCompileTask.exec('npm run --workspaces pre-compile')
    this.compileTask.reset('npm run --workspaces compile')
    this.postCompileTask.reset('npm run --workspaces post-compile')
    this.testTask.reset('npm run --workspaces test')
    this.packageTask.reset('npm run --workspaces package')
  }

  /**
   * Before synthesizing, configure each subproject (and this project) with any configuration that could
   * not be completed until all subprojects were available.
   */
  public preSynthesize() {
    super.preSynthesize()

    this.subprojects.forEach((project) => {
      if (project instanceof NodeProject) {
        // we do not want to install on subprojects, just the monorepo root
        project.tasks.tryFind('install')?.reset()
        project.tasks.tryFind('install:ci')?.reset()
      }
    })

    // configure eslint working directories, so vscode uses correct eslint config for each project
    this.vscode?.settings?.addSetting?.(
      'eslint.workingDirectories',
      this.subprojects.map((reference) =>
        path.relative(this.outdir, reference.outdir)
      )
    )

    // configure workspaces in package.json
    this.package.addField(
      'workspaces',
      this.subprojects.map((subproject) =>
        path.relative(this.outdir, subproject.outdir)
      )
    )
  }

  /**
   * This is a hack to prevent projen from running an "npm install" on each subproject. It also
   * tries to preserve the behavior of replacing dependencies with a '*' version with a semantically
   * valid version as well. Although, to be honest, I don't fully understand that enough to know if that
   * is working or not.
   */
  public postSynthesize(): void {
    super.postSynthesize()

    const accessiblePackage = exposePrivates(this.package)

    const installNeeded = this.subprojects.some((project) => {
      return project instanceof NodeProject && project.package.file.changed
    })

    if (installNeeded) {
      accessiblePackage.installDependencies()
    }

    const needsReinstall = this.subprojects.some((project) => {
      return (
        project instanceof NodeProject &&
        exposePrivates(project.package).resolveDepsAndWritePackageJson()
      )
    })

    if (needsReinstall) {
      accessiblePackage.installDependencies()
    }
  }
}
