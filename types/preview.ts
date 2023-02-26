export interface AssetFSStats {
  size: number,
  atime: string,
  mtime: string,
  ctime: string
}

export interface AssetImageDimentions {
  height: number,
  width: number,
  mode?: 'square' | 'portrait' | 'landscape',
  aspect?: string,
}

export interface AssetStats {
  key: string,
  name: string,
  path: string,
  directory: string,
  mimetype: string,
  stat: AssetFSStats
  git: {
    ctime: string,
    mtime: string,
    versions: number
  },
  dimensions?: AssetImageDimentions,
  source?: string,
  colors?: string[],
}

export interface PreviewState {
  targetWidth: number,
  targetHeight: number,
  stats?: AssetStats,
  snippet: string,
  snippetColors: Record<string, string>,
  snippetType: 'html' | 'inline' | '@nuxt/image',
  alt: string
}
