
export interface ModuleOptions {
  /**
   * Enable Nuxt Devtools integration
   *
   * @default true
   */
  devtools: boolean

  /**
   * @default false
   */
  installIpxMiddleware?: boolean

  /**
   * @default undefined
   */
  hasIpx?: boolean

  /**
   * @default '/_ipx'
   */
  ipxMiddlewarePrefix?: string
}
