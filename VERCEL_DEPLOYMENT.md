# Vercel Deployment Guide for Marbu Backend

This guide will help you deploy the Marbu backend to Vercel.

## Prerequisites

1. **Database Setup**: Since Vercel is serverless, you need a cloud PostgreSQL database. Recommended options:
   - [Supabase](https://supabase.com/) (Free tier available)
   - [Railway](https://railway.app/) (Free tier available)
   - [Neon](https://neon.tech/) (Free tier available)
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Paid)

2. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)

## Deployment Steps

### 1. Setup Cloud Database

Choose one of the database providers above and create a PostgreSQL database. You'll need the connection string (DATABASE_URL).

### 2. Configure Environment Variables

In your Vercel project dashboard, add these environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
NODE_ENV=production
```

### 3. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to marbu-backend directory
cd marbu-backend

# Deploy
vercel

# Follow the prompts and link to your project
```

**Option B: Using Git Integration**
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel will automatically deploy when you push changes

### 4. Run Database Migrations

After deployment, you need to run migrations on your cloud database:

```bash
# Set your DATABASE_URL locally to point to your cloud database
export DATABASE_URL="your-cloud-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Optional: Seed the database
npx prisma db seed
```

### 5. Test Your Deployment

Your API will be available at: `https://your-project-name.vercel.app`

Test endpoints:
- `GET /` - Should return welcome message
- `GET /swagger` - API documentation
- `GET /api/v1/` - Your API routes

## Important Notes

- **Serverless Functions**: Each API request runs in a serverless function with a maximum execution time of 30 seconds (configurable in vercel.json)
- **Cold Starts**: First requests may be slower due to cold starts
- **Database Connections**: Prisma handles connection pooling automatically
- **File Storage**: For file uploads (like signature images), consider using cloud storage services like AWS S3, Cloudinary, or Vercel Blob

## Troubleshooting

1. **Build Errors**: Check the build logs in Vercel dashboard
2. **Database Connection**: Verify your DATABASE_URL is correct
3. **Environment Variables**: Ensure all required env vars are set in Vercel
4. **CORS Issues**: Update CORS settings in your app.js if needed for production

## File Structure for Vercel

```
marbu-backend/
├── api/
│   └── index.js          # Vercel serverless function entry point
├── src/
│   ├── app.js           # Express app configuration
│   └── ...              # Your existing code
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies and scripts
```

The key changes made for Vercel compatibility:
1. Added `vercel.json` configuration
2. Created `api/index.js` as the serverless function entry point
3. Modified routing to work with Vercel's serverless architecture