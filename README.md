# AenSanctum

A modern image sharing platform built with Next.js.

## Local Development

1. Clone the repository
```bash
git clone https://github.com/AENSAX/aensanctum.git
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

## License

MIT License
