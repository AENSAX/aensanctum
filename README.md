# AenSanctum Image Sharing Platform

A modern image sharing platform built with Next.js.

## Features

- User Authentication & Authorization
- Image Upload & Management
- Album Creation & Management
- Tagging System
- Privacy Controls

## Tech Stack

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL
- Material-UI
- NextAuth.js

## Local Development

1. Clone the repository
```bash
git clone https://github.com/your-username/aensanctum.git
cd aensanctum
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Database migration
```bash
npx prisma migrate dev
```

5. Start development server
```bash
npm run dev
```

## Deployment Guide

### Vercel Deployment

1. Fork this repository to your GitHub account
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

### Self-hosted Deployment

1. Clone the repository on your server
2. Install dependencies
3. Build the project
```bash
npm run build
```
4. Run with PM2
```bash
pm2 start npm --name "aensanctum" -- start
```

## Environment Variables

The project requires the following environment variables:

- `DATABASE_URL`: PostgreSQL database connection URL
- `NEXTAUTH_URL`: Authentication callback URL
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `JWT_SECRET`: JWT encryption key
- `UPLOAD_DIR`: Upload directory path

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License
