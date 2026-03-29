#!/usr/bin/env node
import { createPromptModule } from 'inquirer'
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '..', 'templates')

// npm strips .gitignore and treats package.json as the package manifest,
// so templates use prefixed names that get renamed on copy.
const RENAMES = {
  '_gitignore': '.gitignore',
  '_package.json': 'package.json',
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, RENAMES[entry] ?? entry)
    statSync(srcPath).isDirectory()
      ? copyDir(srcPath, destPath)
      : writeFileSync(destPath, readFileSync(srcPath))
  }
}

async function resolveVersion(pkg) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`, {
      headers: { Accept: 'application/vnd.npm.install-v1+json' },
    })
    if (!res.ok) return 'latest'
    const data = await res.json()
    return `^${data.version}`
  } catch {
    return 'latest'
  }
}

async function resolvePackageVersions(pkg) {
  const allNames = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]
  const entries = await Promise.all(allNames.map(async name => [name, await resolveVersion(name)]))
  const resolved = Object.fromEntries(entries)
  for (const section of ['dependencies', 'devDependencies']) {
    for (const name of Object.keys(pkg[section] ?? {})) {
      pkg[section][name] = resolved[name]
    }
  }
}

const prompt = createPromptModule()

async function main() {
  console.log('\n  vue-kaspa-cli — scaffold a Kaspa-connected Vue/Nuxt app\n')

  const answers = await prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'kaspa-app',
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Framework:',
      choices: ['Vue', 'Nuxt'],
    },
  ])

  const { projectName, framework } = answers
  const name = projectName.trim() || 'kaspa-app'
  const targetDir = join(process.cwd(), name)

  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    console.error(`\n  "${name}" already exists and is not empty.\n`)
    process.exit(1)
  }

  copyDir(join(TEMPLATES_DIR, framework.toLowerCase()), targetDir)

  const pkgPath = join(targetDir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  pkg.name = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  process.stdout.write('  Resolving latest package versions…')
  await resolvePackageVersions(pkg)
  process.stdout.write(' done\n')

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  const editHint = framework === 'Nuxt'
    ? 'app/components/KaspaStatus.vue'
    : 'src/components/KaspaStatus.vue'

  console.log(`
  Done!

  cd ${name}
  npm install
  npm run dev

  Edit ${editHint} to start building.
  Docs → https://vue-kaspa.vercel.app

`)
}

main().catch(e => { console.error(e); process.exit(1) })
