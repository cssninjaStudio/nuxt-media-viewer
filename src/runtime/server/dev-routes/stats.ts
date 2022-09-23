import { promises as fsp } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import sizeOf from 'image-size'
import { resolve, join } from 'pathe'

const execPromise = promisify(exec)
const sizeOfPromise = promisify(sizeOf)

const COLOR_RE = /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^)]*\)|currentcolor/gi

const config = useRuntimeConfig()
const dir = config.mediaViewer.publicRoot
// const dir = resolve(process.cwd(), process.env.NODE_ENV === 'development' ? './public' : './.output/public')

type ImageDimensions = Awaited<ReturnType<typeof sizeOfPromise>> & { mode?: string, aspect?: string }

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
  const { key } = useQuery(event) as { key: string }
  const part = key.split(':')
  const name = part.pop()
  // console.log('nitro', nitro)

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

  const dimensions: ImageDimensions | undefined = mimetype.startsWith('image/') ? await sizeOfPromise(absolutePath) : undefined
  const source = mimetype.startsWith('image/svg') ? await fsp.readFile(absolutePath, 'utf-8') : undefined
  const git = {
    ctime,
    mtime,
    versions
  }

  if (dimensions) {
    if (dimensions.height === 0 || dimensions.width === 0) {
      return
    }

    if (dimensions.height === dimensions.width) {
      dimensions.aspect = '1:1'
      dimensions.mode = 'square'
    } else {
      let gcd = -1
      let remainder: number
      let dividend: number
      let divisor: number

      if (dimensions.height > dimensions.width) {
        dividend = dimensions.height
        divisor = dimensions.width
        dimensions.mode = 'portrait'
      } else {
        dividend = dimensions.width
        divisor = dimensions.height
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

      dimensions.aspect = `${dimensions.width / gcd}:${dimensions.height / gcd}`
    }
  }

  const colors: string[] = source?.match(COLOR_RE).reduce((acc, color) => {
    if (!acc.includes(color)) {
      acc.push(color)
    }
    return acc
  }, []) ?? []

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
      atime: imageStat.atime,
      mtime: imageStat.mtime,
      ctime: imageStat.ctime
    }
  }
})
