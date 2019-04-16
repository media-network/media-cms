import path from 'path'

import createDevServer from './dev-server'

export default async ({ name, publicPath }) => {
  console.log(`Loading theme [${name}]... at: ${publicPath}`)

  const cwd = process.cwd()
  const themeDir = path.join(cwd, 'content/themes', name)
  const outDir = path.join(cwd, 'data/dist')
  const manifestPath = path.join(outDir, 'manifest.json')

  const devServer = await createDevServer({
    themeDir,
    outDir,
    manifestPath,
    publicPath
  })

  return {
    devServer,
    manifestPath,
    themeDir,
    outDir,
    publicPath
  }
}
