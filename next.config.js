const nextConfig = {
    experimental: {
        turbopackFileSystemCacheForDev: true,
    },
    reactCompiler: true,
    typedRoutes: true,

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
                port: "",
                pathname: "/avatars/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
