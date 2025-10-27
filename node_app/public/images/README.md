# Image Assets

This directory contains image assets for the API Health Dashboard.

## Avatar Images

Team member avatars are generated using the UI Avatars API service. No local image files are required as avatars are dynamically generated.

## Adding Custom Images

To add custom avatar images:

1. Place image files in this directory
2. Update the `avatar` field in `/public/js/team.js`
3. Use relative paths like: `/images/avatar1.jpg`

## Supported Formats

- JPG/JPEG
- PNG
- SVG
- WebP

## Recommended Sizes

- Avatars: 200x200px minimum
- Icons: 32x32px or 64x64px
- Logos: SVG preferred for scalability
