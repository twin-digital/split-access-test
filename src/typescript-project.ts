import { javascript } from 'projen'
import {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from 'projen/lib/typescript'
import {
  DefaultCompilerOptions,
  DefaultPrettierOptions,
  DEFAULTS,
} from './constants'
import { addReferences, updateTypescriptConfig } from './monorepo'
import { TwinDigitalTypeScriptOptions } from './typescript-options'

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
        },
      },
    })

    updateTypescriptConfig(this)
    addReferences(this, references)
  }
}
