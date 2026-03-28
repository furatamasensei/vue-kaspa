#!/usr/bin/env node
/**
 * Patches kaspa.js to preserve wasm-bindgen class names through minification.
 *
 * wasm-bindgen generates classes like `export class Resolver { ... }` and the
 * WASM binary validates passed objects by checking obj.constructor.name at
 * runtime. When a bundler minifies the file, every class becomes `class e`,
 * so obj.constructor.name === 'e' instead of 'Resolver', causing runtime errors.
 *
 * This script adds:
 *   Object.defineProperty(ClassName, 'name', { value: 'ClassName' });
 * after each class definition. String literals survive minification, so the
 * property assignment restores the correct name even after class renaming.
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const filePath = join(__dirname, 'kaspa.js')
const code = readFileSync(filePath, 'utf8')
const lines = code.split('\n')
const output = []
let patched = 0
let i = 0

while (i < lines.length) {
  const line = lines[i]
  const classMatch = line.match(/^export class (\w+) \{$/)

  if (classMatch) {
    const className = classMatch[1]
    output.push(line)
    i++

    // Track brace depth to find the matching closing brace.
    // wasm-bindgen output is regular enough that a simple counter works.
    let depth = 1
    while (i < lines.length && depth > 0) {
      const l = lines[i]
      for (const ch of l) {
        if (ch === '{') depth++
        else if (ch === '}') depth--
      }
      output.push(l)
      i++
    }

    // Insert after the class's closing brace line
    output.push(`Object.defineProperty(${className}, 'name', { value: '${className}' });`)
    patched++
  } else {
    output.push(line)
    i++
  }
}

writeFileSync(filePath, output.join('\n'))
console.log(`Patched ${patched} classes in kaspa.js`)
