import type { MaybeComputedRef } from '@vueuse/core'
import { computed, isRef, type ComputedRef } from 'vue'
import { useRuntimeConfig } from '#app'
import { joinURL, withTrailingSlash } from 'ufo'
import { MediaPreviewConfig } from '~~/utils/options'
// replace an unstorage key 'root:public:xxx' to a path '/xxx

const mvBaseURL = useRuntimeConfig().public.mvBaseURL

export function keyPath (key?: string): string {
  if (!key) {
    return ''
  }

  return key.replace(/:/g, '/').replace(
    'root/public',
    ''
  )
}

export function useKeyPath (key: MaybeComputedRef<string>, config?: MaybeComputedRef<MediaPreviewConfig | undefined | null>): ComputedRef<string> {
  const keyRef = computed(() => {
    return typeof key === 'function' ? key() : isRef(key) ? key.value : key
  })

  const configRef = computed(() => {
    return typeof config === 'function' ? config() : isRef(config) ? config.value : config
  })

  return computed(() => {
    const prefix = withTrailingSlash(joinURL(mvBaseURL, (configRef.value?.hasIpx && configRef.value?.ipxMiddlewarePrefix ? configRef.value.ipxMiddlewarePrefix : '')))
    return keyPath(keyRef.value).replace(/^\//, prefix)
  })
}
