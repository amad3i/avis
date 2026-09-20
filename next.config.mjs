/** @type {import('next').NextConfig} */
const nextConfig = {
    // dev (turbopack) и prod (webpack) собираются в разные папки - не конфликтуют
    distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
    experimental: {
        // Клиентский кэш роутера: возврат/повторный заход на уже открытую
        // страницу отдаётся из кэша без повторного ререндера и без вспышек.
        staleTimes: {
            static: 86400,
            dynamic: 86400,
        },
    },
    // На этапе сборки Vercel ESLint падает с "Cannot serialize key parse in parser".
    // Линт остаётся доступен локально через `npm run lint`.
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
                pathname: '**',
            },
        ],
    },
    // Базовые security-заголовки (defense-in-depth поверх экранирования React).
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "no-referrer" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "img-src 'self' data: https://*.public.blob.vercel-storage.com https://*.tile.openstreetmap.org",
                            "style-src 'self' 'unsafe-inline'",
                            "script-src 'self' 'unsafe-inline'",
                            "connect-src 'self'",
                            "base-uri 'self'",
                            "frame-ancestors 'none'",
                            "form-action 'self'",
                            "object-src 'none'",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
