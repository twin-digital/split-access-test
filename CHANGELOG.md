# @twin-digital/projen

## 0.4.0

### Minor Changes

- 0370f8a: Converted projen lib to ESM.

  BREAKING CHANGE: ES modules are not backwards-compatible, so non-esm projects will have to be converted or import this module using dynamic import() statements.

## 0.3.2

### Patch Changes

- 294cb7e: Added "esm: true" to tsconfig for ESM packages.

## 0.3.1

### Patch Changes

- 7b3ce9a: Fixed error preventing MonorepoProject from being imported.

## 0.3.0

### Minor Changes

- 78cd212: Added ESM support, and enabled it by default.

  BREAKING CHANGE: ES modules are not backwards-compatible, so non-esm projects will have to set "esModule: false" in their Typescript projects.

- 43bdf79: Added "loadProjects" helper for creating monorepos.

### Patch Changes

- a59a96a: Use more aggressive strategy to prevent monorepo child packages from installing dependencies.

## 0.2.2

### Patch Changes

- 5be5ddd: Fixed error when creating TwinDigitalMonoRepoProjects.

## 0.2.1

### Patch Changes

- a328ad9: Added missing exports for new types.

## 0.2.0

### Minor Changes

- c9facf0: Added TwinDigitalMonorepoProject to projen lib.

## 0.1.2

### Patch Changes

- 88d0887: Fix reference path mappings so they can be used by ts-node.

## 0.1.1

### Patch Changes

- 6e91513: Update dependencies.

## 0.1.0

### Minor Changes

- 8da816f: Add monorepo support.

## 0.0.2

### Patch Changes

- c47e065: Changed GHA workflow filename to resolve lint conflicts.

## 0.0.1

### Patch Changes

- 6fdb010: Add cdk pipeline components.
