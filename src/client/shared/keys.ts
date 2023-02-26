import type { MaybeComputedRef } from '@vueuse/core'
import { reactive, computed, isRef, type ComputedRef } from 'vue'

// replace an unstorage key 'root:public:xxx' to a path '/xxx
type Options = { hasIpx: boolean, ipxMiddlewarePrefix: string }

export function keyToPath (key: MaybeComputedRef<string>, config: MaybeComputedRef<Options | null>): ComputedRef<string> {
  const keyRef = computed(() => {
    return typeof key === 'function' ? key() : isRef(key) ? key.value : key
  })

  const configRef = computed(() => {
    return typeof config === 'function' ? config() : isRef(config) ? config.value : config
  })

  return computed(() => {
    return keyRef.value.replace(/:/g, '/').replace(
      'root/public',
      configRef.value?.hasIpx ? configRef.value?.ipxMiddlewarePrefix : ''
    )
  })
}
