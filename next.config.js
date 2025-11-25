export async function redirects() {
    return [
        {
            source: "/admin",
            destination: "/admin/users",
            permanent: true,
        },
        {
            source: "/trading",
            destination: "/trading/journals",
            permanent: true,
        },
    ];
}

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
    redirects,
};

export default nextConfig;
