# Deploying Supersonic Music to Production

## Architecture Overview

This app consists of two parts:
1. **Frontend (Next.js)** - Deploy to Netlify
2. **Backend (Node.js server)** - Deploy to Render, Railway, or Heroku

## Step 1: Deploy Backend First

The backend server handles YouTube audio streaming. You need to deploy it separately.

### Option A: Deploy to Render (Recommended - Free tier available)

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository (or use "Deploy from Git")
4. Configure:
   - **Name**: `supersonic-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `YT_KEY`: Your YouTube Data API key (optional, for related videos)
5. Click "Create Web Service"
6. Copy your deployed URL (e.g., `https://supersonic-backend.onrender.com`)

### Option B: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Select the `backend` folder
4. Add environment variable `YT_KEY` if needed
5. Copy the deployed URL

## Step 2: Deploy Frontend to Netlify

### Prerequisites
- Push your code to GitHub/GitLab/Bitbucket

### Deployment Steps

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add Environment Variables:
   - Click "Site settings" → "Environment variables"
   - Add: `NEXT_PUBLIC_BACKEND_URL` = `https://your-backend-url.onrender.com`
6. Click "Deploy site"

### Important: Update Environment Variable

After deploying the backend, you MUST update the frontend's environment variable:

1. Go to Netlify Dashboard → Your Site → Site settings
2. Navigate to "Environment variables"
3. Add or update: `NEXT_PUBLIC_BACKEND_URL` with your backend URL
4. Trigger a redeploy

## Step 3: Verify Deployment

1. Visit your Netlify URL
2. Try playing a song
3. Check browser console for any errors

## Troubleshooting

### Audio not playing
- Verify backend is running: visit `https://your-backend.onrender.com/health`
- Check CORS settings in backend
- Ensure `NEXT_PUBLIC_BACKEND_URL` is set correctly

### Related tracks not loading
- Set `YT_KEY` environment variable in backend with a valid YouTube Data API key

### Images not loading
- YouTube thumbnails should work automatically
- Check network tab for blocked requests

## Local Development

For local development, the frontend uses `http://localhost:5000` as fallback:

```bash
# Terminal 1: Run backend
cd backend
npm install
npm start

# Terminal 2: Run frontend
npm run dev
```

## Environment Variables Summary

### Backend (Render/Railway)
| Variable | Required | Description |
|----------|----------|-------------|
| `YT_KEY` | Optional | YouTube Data API key for related videos |

### Frontend (Netlify)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | URL of your deployed backend |

## Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. (Optional) Restrict the key to YouTube Data API only
