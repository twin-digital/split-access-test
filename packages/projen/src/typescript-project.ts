import {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from 'projen/lib/typescript/index.js'
import {
  DefaultCompilerOptions,
  DefaultPrettierOptions,
  DEFAULTS,
} from './constants.js'
import { addReferences, updateTypescriptConfig } from './monorepo.js'
import { TwinDigitalTypeScriptOptions } from './typescript-options.js'
import { TypeScriptModuleResolution } from 'projen/lib/javascript/index.js'

export type TwinDigitalTypescriptProjectOptions = Omit<
  TypeScriptProjectOptions,
  | 'defaultReleaseBranch'
  | 'mutableBuild'
  | 'projenrcTs'
  | 'scopedPackagesOptions'
> &
  TwinDigitalTypeScriptOptions

export class TwinDigitalTypescriptProject extends TypeScriptProject {
  constructor({
    additionalScopedPackages = [],
    codeArtifactOptions,
    esModule = true,
    githubOptions,
    packageName,
    references = [],
    ...props
  }: TwinDigitalTypescriptProjectOptions) {
    super({
      ...DEFAULTS,
      codeArtifactOptions,
      githubOptions: {
        mergify: false,
        ...(githubOptions ?? {}),
      },
      gitignore: [...(props.gitignore ?? []), '.env'],
      packageName: packageName ?? `@twin-digital/${props.name}`,
      prettierOptions: {
        ...DefaultPrettierOptions,
        ...(props.prettierOptions ?? {}),
      },
      // we have no projenrc files in monorepo subprojects, so avoid adding the config
      projenrcTs: props.parent !== undefined ? false : true,
      ...props,
      mutableBuild: false,
      sampleCode: false,
      scopedPackagesOptions: [
        ...additionalScopedPackages,
        {
          registryUrl:
            'https://twin-digital-934979133063.d.codeartifact.us-east-2.amazonaws.com/npm/shared/',
          scope: '@twin-digital',
        },
      ],
      tsconfig: {
        ...(props.tsconfig ?? {}),
        compilerOptions: {
          ...DefaultCompilerOptions,
          ...(props.tsconfig?.compilerOptions ?? {}),
          module: esModule ? 'node16' : undefined,
          moduleResolution: esModule
            ? TypeScriptModuleResolution.NODE16
            : TypeScriptModuleResolution.NODE,
        },
      },
    })

    if (esModule) {
      this.package.addField('type', 'module')

      this.tsconfig?.file?.addOverride?.('ts-node.esm', true)
      this.tsconfigDev.file.addOverride('ts-node.esm', true)
    }

    updateTypescriptConfig(this)
    addReferences(this, references)
  }
}
