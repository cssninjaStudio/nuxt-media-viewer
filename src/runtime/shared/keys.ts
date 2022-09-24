// replace an unstorage key 'root:public:xxx' to a path '/xxx
export function keyToPath (key: string, ipxPrefix?: boolean): string {
  return key.replace(/:/g, '/').replace(
    'root/public/',
    ipxPrefix ? '/_ipx/' : '/'
  )
}
