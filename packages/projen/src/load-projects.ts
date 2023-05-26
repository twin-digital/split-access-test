import fs from 'node:fs'
import path from 'node:path'

export const loadProjects = async (configPath: string): Promise<void> => {
  const files = fs.readdirSync(configPath)

  for (const file of files) {
    if (path.extname(file) === '.ts' || path.extname(file) === '.js') {
      await import(path.join(configPath, file))
    }
  }
}
