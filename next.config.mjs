/** @type {import('next').NextConfig} */
const repoName = process.env.PAGES_REPO_NAME ?? process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const useProjectBasePath = repoName !== '' && !repoName.endsWith('.github.io')
const explicitBasePath = process.env.PAGES_BASE_PATH
const inferredBasePath = useProjectBasePath ? `/${repoName}` : ''
const basePath = explicitBasePath
  ? (explicitBasePath.startsWith('/') ? explicitBasePath : `/${explicitBasePath}`)
  : inferredBasePath

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
}

export default nextConfig
