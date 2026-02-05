/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    buildExcludes: [
        /middleware-manifest\.json$/,
        /app-build-manifest\.json$/,
        /middleware-build-manifest\.json$/,
        /_next\/static\/.*manifest\.json$/,
        /.*\.map$/
    ],
});

const nextConfig = {};

module.exports = withPWA(nextConfig);
