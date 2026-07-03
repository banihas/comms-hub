import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const repoName = process.env.PAGES_REPO_NAME || 'sturdy-winner'
const basePath = process.env.PAGES_BASE_PATH || '/pages/Amir-Banihashemi/sturdy-winner'
const outDir = 'out'
const docsDir = 'docs'

try {
  execSync('npm run build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      PAGES_REPO_NAME: repoName,
      PAGES_BASE_PATH: basePath,
    },
  })
} catch {
  process.exit(1)
}

if (!existsSync(outDir)) {
  console.error('Build completed but no out folder was found.')
  process.exit(1)
}

rmSync(docsDir, { recursive: true, force: true })
cpSync(outDir, docsDir, { recursive: true })
writeFileSync(join(docsDir, '.nojekyll'), '')

console.log(`Prepared ${docsDir} for branch deployment using base path ${basePath}.`)
