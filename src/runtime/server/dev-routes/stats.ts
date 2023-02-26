import { promises as fsp } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import sizeOf from 'image-size'
import { join } from 'pathe'
import { type ISize } from 'image-size/dist/types/interface'
import { defineEventHandler, getQuery } from 'h3'
import type { AssetStats } from '../../../../types/preview'
// @ts-ignore
import { useRuntimeConfig } from '#imports'

const execPromise = promisify(exec)
const sizeOfPromise = promisify(sizeOf)

// color regex extractors
const COLOR_RE = /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^)]*\)|currentcolor/gi

// get real path of public directory
const config = useRuntimeConfig()
const dir = config.mediaViewer.publicRoot

// file system stats helpers
async function getMimetype (path: string) {
  try {
    const result = await execPromise(`file --mime-type -b "${path}"`)
    return result.stdout.toString().trim()
  } catch {
    return ''
  }
}
async function getGitCtime (path: string) {
  try {
    const result = await execPromise(`git log --follow --format=%ci --date default "${path}" | tail -1`)
    const output = result.stdout.toString().trim()
    return new Date(output).toISOString()
  } catch {
    return ''
  }
}
async function getGitMtime (path: string) {
  try {
    const result = await execPromise(`git log -1 --format=%ci --date default "${path}" | tail -1`)
    const output = result.stdout.toString().trim()
    return new Date(output).toISOString()
  } catch {
    return ''
  }
}
async function getGitVersions (path: string) {
  try {
    const result = await execPromise(`git log --oneline "${path}" | wc -l`)
    const output = result.stdout.toString().trim()
    return Number(output)
  } catch {
    return 0
  }
}

export default defineEventHandler(async (event) => {
  const { key } = getQuery(event) as { key: string }
  const part = key.split(':')
  const name = part.pop()

  if (!name) {
    return
  }

  // remove root
  part.shift()
  // remove public
  part.shift()

  const directory = `/${part.join('/')}`
  const path = join(directory, name)

  const absolutePath = join(dir, directory, name)
  const [
    imageStat,
    mimetype,
    ctime,
    mtime,
    versions
  ] = await Promise.all([
    fsp.stat(absolutePath),
    getMimetype(absolutePath),
    getGitCtime(absolutePath),
    getGitMtime(absolutePath),
    getGitVersions(absolutePath)
  ])

  const git = {
    ctime,
    mtime,
    versions
  }

  // extract images specific informations
  const dimensions: ISize & { mode?: 'portrait' | 'landscape' | 'square'; aspect?: string } | undefined = mimetype.startsWith('image/') ? await sizeOfPromise(absolutePath).then(r => r) : undefined
  const source = mimetype.startsWith('image/svg') ? await fsp.readFile(absolutePath, 'utf-8') : undefined

  // compute mode and aspect ratio
  if (dimensions) {
    const width = dimensions.width ?? 0
    const height = dimensions.height ?? 0

    if (height === 0 || width === 0) {
      return
    }

    if (height === width) {
      dimensions.aspect = '1:1'
      dimensions.mode = 'square'
    } else {
      let gcd = -1
      let remainder: number
      let dividend: number
      let divisor: number

      if (height > width) {
        dividend = height
        divisor = width
        dimensions.mode = 'portrait'
      } else {
        dividend = width ?? 0
        divisor = height ?? 0
        dimensions.mode = 'landscape'
      }

      // compute greater common divisor between width & height
      while (gcd === -1) {
        remainder = dividend % divisor

        if (remainder === 0) {
          gcd = divisor
        } else {
          dividend = divisor
          divisor = remainder
        }
      }

      dimensions.aspect = `${width / gcd}:${height / gcd}`
    }
  }

  // extract colors
  const colors: string[] = source?.match(COLOR_RE)?.reduce((acc, color) => {
    if (color && !acc.includes(color)) {
      acc.push(color)
    }
    return acc
  }, [] as string[]) ?? []

  return {
    key,
    name,
    path,
    directory,
    mimetype,
    dimensions,
    git,
    source,
    colors,
    stat: {
      size: imageStat.size,
      atime: imageStat.atime.toISOString(),
      mtime: imageStat.mtime.toISOString(),
      ctime: imageStat.ctime.toISOString()
    }
  } as AssetStats
})
