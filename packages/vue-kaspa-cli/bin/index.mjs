#!/usr/bin/env node
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
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

const rl = createInterface({ input, output })

async function ask(question, fallback) {
  const answer = (await rl.question(question)).trim()
  return answer || fallback
}

async function choose(question, choices) {
  output.write(`${question}\n${choices.map((c, i) => `  ${i + 1}) ${c}`).join('\n')}\n`)
  while (true) {
    const n = parseInt((await rl.question('  Enter number: ')).trim(), 10) - 1
    if (n >= 0 && n < choices.length) return choices[n]
    output.write(`  Please enter 1–${choices.length}.\n`)
  }
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

async function main() {
  output.write('\n  vue-kaspa-cli — scaffold a Kaspa-connected Vue/Nuxt app\n\n')

  const name = await ask('  Project name (kaspa-app): ', 'kaspa-app')
  const framework = await choose('\n  Framework:', ['Vue', 'Nuxt'])
  rl.close()

  const targetDir = join(process.cwd(), name)

  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    output.write(`\n  "${name}" already exists and is not empty.\n\n`)
    process.exit(1)
  }

  copyDir(join(TEMPLATES_DIR, framework.toLowerCase()), targetDir)

  const pkgPath = join(targetDir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  pkg.name = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  output.write(`
  Done!

  cd ${name}
  npm install
  npm run dev

  Edit src/components/KaspaStatus.vue to start building.
  Docs → https://furatamasensei.github.io/vue-kaspa

`)
}

main().catch(e => { console.error(e); process.exit(1) })
