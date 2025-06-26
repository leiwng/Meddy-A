const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // 开发模式
  reactStrictMode: false,  // 是否启用严格模式
  // output: '',        // 静态导出模式
  // 路径和URL配置
  basePath: '',           // 应用的基本路径
  assetPrefix: '',        // 静态资源前缀
  // 构建配置
  distDir: '.next',       // 构建输出目录
  
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '117.50.181.9',
        port: '2024',
        pathname: '/yixiaozhu_api/image',
      },
      {
        protocol: 'http',
        hostname: '117.50.181.9',
        port: '2024',
        pathname: '/yixiaozhu_api_test/image',
      }
    ],     // 允许的图片域名
    // deviceSizes: [640, 750, 828], // 响应式图片尺寸
    // formats: ['image/webp'],      // 支持的图片格式
  },
  
  // 环境变量
  env: {
    // customKey: 'value',
  },
  
  // 重定向
  // async redirects() {
  //   return [
  //     // {
  //     //   source: '/old-path',
  //     //   destination: '/new-path',
  //     //   permanent: true,
  //     // },
  //   ]
  // },
  
  // 路径重写
  // async rewrites() {
  //   return [
  //     // {
  //     //   source: '/api/:path*',
  //     //   destination: 'https://api.example.com/:path*',
  //     // },
  //   ]
  // },
  
  // webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义 webpack 配置
    config.module.rules.forEach(rule => {
      if (rule.oneOf) {
        rule.oneOf.forEach(moduleLoader => {
          if (
            Array.isArray(moduleLoader.use) && 
            moduleLoader.use.some(l => l.loader?.includes('css-loader'))
          ) {
            // 定位css-loader配置项
            const cssLoader = moduleLoader.use.find(l => 
              l.loader.includes('css-loader') &&
              !l.loader.includes('postcss-loader')
            );
            
            if (cssLoader && cssLoader.options.modules) {
              // 覆盖类名生成规则
              cssLoader.options.modules = {
                ...cssLoader.options.modules,
                localIdentName: '[hash:base64:8]', // 8位哈希
                auto: true // 强制所有符合条件的文件启用模块化
              };
            }
          }
        });
      }
    });
    return config;
  },
  
  // 页面扩展配置
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 压缩配置
  compress: true,  // 启用 gzip 压缩
  
  // 实验性功能
  experimental: {
  },
  
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
})