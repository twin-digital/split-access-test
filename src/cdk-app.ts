import fs from 'node:fs'
import path from 'node:path'
import { awscdk, Component } from 'projen'
import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk/index.js'

import { AwsCdkPipeline } from './aws-cdk-pipeline.js'
import {
  DefaultCompilerOptions,
  DefaultPrettierOptions,
  DEFAULTS,
} from './constants.js'
import { addReferences, updateTypescriptConfig } from './monorepo.js'
import { TwinDigitalTypeScriptOptions } from './typescript-options.js'
import { TypeScriptModuleResolution } from 'projen/lib/javascript/index.js'

export type TwinDigitalCdkAppOptions = Omit<
  awscdk.AwsCdkTypeScriptAppOptions,
  | 'cdkVersion'
  | 'defaultReleaseBranch'
  | 'mutableBuild'
  | 'projenrcTs'
  | 'release'
  | 'scopedPackagesOptions'
> &
  TwinDigitalTypeScriptOptions & {
    cdkVersion?: string
  }

export class TwinDigitalCdkApp extends awscdk.AwsCdkTypeScriptApp {
  constructor({
    additionalScopedPackages = [],
    codeArtifactOptions,
    esModule = true,
    githubOptions,
    packageName,
    references = [],
    ...props
  }: TwinDigitalCdkAppOptions) {
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
      deps: [...(props.deps ?? []), 'cdk-pipelines-github'],
      mutableBuild: false,
      release: true,
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
      // set package type
      this.package.addField('type', 'module')
    }

    updateTypescriptConfig(this)
    addReferences(this, references)

    new AwsCdkPipeline(this, {
      codeArtifactRole: codeArtifactOptions?.roleToAssume,
      deploymentRole:
        'arn:aws:iam::934979133063:role/CommonCicd-RootGitHubGithubActionsACC56793-79JE121HOPUG',
    })

    new SamplePipeline(this)
  }
}

class SamplePipeline extends Component {
  private readonly appProject: AwsCdkTypeScriptApp

  constructor(project: AwsCdkTypeScriptApp) {
    super(project)
    this.appProject = project
  }

  public synthesize() {
    const outdir = this.appProject.outdir
    const srcdir = path.join(outdir, this.appProject.srcdir)
    if (
      fs.existsSync(srcdir) &&
      fs.readdirSync(srcdir).filter((x) => x === this.appProject.appEntrypoint)
        .length > 0
    ) {
      return
    }

    const srcCode = `import { App } from 'aws-cdk-lib'
import { CdkPipeline } from './cdk-pipeline'

const app = new App()

new CdkPipeline(app)

app.synth()
`

    fs.mkdirSync(srcdir, { recursive: true })
    fs.writeFileSync(path.join(srcdir, this.appProject.appEntrypoint), srcCode)
  }
}
