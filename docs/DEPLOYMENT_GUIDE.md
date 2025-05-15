
# Deployment Guide

This document provides comprehensive instructions for deploying both the frontend application and the Rembg background removal microservice.

## Table of Contents
- [Frontend Deployment](#frontend-deployment)
  - [Prerequisites](#frontend-prerequisites)
  - [Build Process](#build-process)
  - [Deployment Options](#deployment-options)
  - [Environment Configuration](#environment-configuration)
  - [Performance Optimization](#performance-optimization)
- [Rembg Microservice Deployment](#rembg-microservice-deployment)
  - [Prerequisites](#backend-prerequisites)
  - [Docker Deployment](#docker-deployment)
  - [Manual Deployment](#manual-deployment)
  - [Configuration Options](#configuration-options)
  - [Security Considerations](#security-considerations)
- [Integration Configuration](#integration-configuration)
- [Troubleshooting](#troubleshooting)

## Frontend Deployment

### Frontend Prerequisites
- Node.js 16+ and npm 7+ or equivalent
- Git (for version control)
- Access to your hosting provider's dashboard or CLI

### Build Process
1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd kollect-it-image-tools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the production bundle:
   ```bash
   npm run build
   ```

4. The optimized assets will be available in the `dist` directory.

### Deployment Options

#### Option 1: Static Hosting (Recommended)
The frontend is a static Single Page Application that can be deployed to any static hosting provider:

1. **Netlify**:
   - Connect your GitHub repository or drag and drop your `dist` folder
   - Configure build settings if connecting directly to repository:
     - Build command: `npm run build`
     - Publish directory: `dist`

2. **Vercel**:
   - Import your project from GitHub
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **GitHub Pages**:
   - Update `vite.config.ts` to include your base path if not deploying to root:
     ```typescript
     base: '/your-repo-name/',
     ```
   - Deploy using GitHub Actions or manually

4. **AWS S3 + CloudFront**:
   ```bash
   # Configure AWS CLI
   aws s3 sync dist/ s3://your-bucket-name/ --delete
   # Invalidate CloudFront cache if using CDN
   aws cloudfront create-invalidation --distribution-id YOUR_CF_DISTRIBUTION_ID --paths "/*"
   ```

#### Option 2: Server Deployment
For server deployment with Node.js:

1. Install a static file server:
   ```bash
   npm install -g serve
   ```

2. Serve the built files:
   ```bash
   serve -s dist
   ```

3. For production, use PM2 to manage the process:
   ```bash
   npm install -g pm2
   pm2 start "serve -s dist" --name "kollect-it-frontend"
   ```

### Environment Configuration

Create a `.env` file for local development or set environment variables on your hosting platform:

```
# Backend API Configuration
VITE_API_URL=https://your-backend-url.com/api
VITE_DEFAULT_REMBG_URL=https://your-rembg-service.com/remove-bg

# Feature Flags
VITE_ENABLE_BACKGROUND_REMOVAL=true
VITE_ENABLE_IMAGE_CACHING=true

# Analytics (if applicable)
VITE_ANALYTICS_ID=your-analytics-id
```

### Performance Optimization

1. **CDN Configuration**:
   - Enable caching for static assets
   - Configure proper Cache-Control headers
   - Example Netlify `_headers` file:
     ```
     /assets/*
       Cache-Control: public, max-age=31536000, immutable
     /*.html
       Cache-Control: public, max-age=0, must-revalidate
     ```

2. **Compression**:
   - Ensure gzip/Brotli compression is enabled on your server
   - Most static hosts handle this automatically

## Rembg Microservice Deployment

### Backend Prerequisites
- Docker environment OR
- Python 3.8+ with pip
- 2GB RAM minimum (4GB recommended)
- 2+ CPU cores
- 5GB free disk space

### Docker Deployment

1. Build the Docker image:
   ```bash
   cd backend
   docker build -t rembg-service .
   ```

2. Run the container:
   ```bash
   docker run -d -p 5000:5000 --restart unless-stopped --name rembg-service rembg-service
   ```

3. **Docker Compose** (recommended for production):
   Create a `docker-compose.yml` file:
   ```yaml
   version: '3'
   services:
     rembg-service:
       build: ./backend
       container_name: rembg-service
       restart: unless-stopped
       ports:
         - "5000:5000"
       environment:
         - MAX_FILE_SIZE=10
         - MODEL=u2net
       volumes:
         - rembg-cache:/app/cache

   volumes:
     rembg-cache:
   ```

   Run with:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Run with Gunicorn (recommended for production):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. For production, use a process manager:
   ```bash
   # Using Supervisor
   sudo apt-get install supervisor
   ```

   Create `/etc/supervisor/conf.d/rembg.conf`:
   ```
   [program:rembg]
   directory=/path/to/backend
   command=gunicorn -w 4 -b 0.0.0.0:5000 app:app
   autostart=true
   autorestart=true
   stderr_logfile=/var/log/rembg.err.log
   stdout_logfile=/var/log/rembg.out.log
   user=www-data
   ```

   Update and start:
   ```bash
   sudo supervisorctl reread
   sudo supervisorctl update
   sudo supervisorctl start rembg
   ```

### Configuration Options

Configuration can be set via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | 5000 |
| `MAX_FILE_SIZE` | Maximum file size in MB | 10 |
| `MODEL` | U2Net model to use | u2net |
| `CACHE_DIR` | Cache directory for models | ./cache |
| `CORS_ORIGINS` | Comma-separated CORS origins | * |

### Security Considerations

1. **API Authentication**:
   - For production, add API key authentication by modifying `app.py`:
   ```python
   API_KEY = os.environ.get('API_KEY')
   
   @app.before_request
   def authenticate():
       if API_KEY and request.headers.get('X-API-Key') != API_KEY:
           return jsonify({"error": "Unauthorized"}), 401
   ```

2. **Rate Limiting**:
   Install Flask-Limiter:
   ```bash
   pip install Flask-Limiter
   ```

   Add to `app.py`:
   ```python
   from flask_limiter import Limiter
   from flask_limiter.util import get_remote_address
   
   limiter = Limiter(
       app=app,
       key_func=get_remote_address,
       default_limits=["200 per day", "50 per hour"]
   )
   ```

3. **Reverse Proxy Configuration**:
   For production, use Nginx as a reverse proxy.
   
   Example `/etc/nginx/sites-available/rembg`:
   ```
   server {
       listen 80;
       server_name your-api-domain.com;
   
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           client_max_body_size 10M;
       }
   }
   ```

## Integration Configuration

To connect the frontend with the Rembg microservice:

1. Update the frontend configuration in settings or `.env`:
   ```
   VITE_DEFAULT_REMBG_URL=https://your-api-domain.com/remove-bg
   ```

2. If using API key authentication:
   ```
   VITE_DEFAULT_REMBG_API_KEY=your-api-key
   ```

3. Test the integration by uploading an image and enabling background removal.

## Troubleshooting

### Frontend Issues

1. **Blank Screen After Deployment**:
   - Check browser console for errors
   - Verify your base path configuration in `vite.config.ts`
   - Ensure all assets are being served correctly

2. **API Connection Errors**:
   - Verify CORS configuration on the backend
   - Check API URL configuration
   - Test API directly using tools like Postman

3. **Performance Problems**:
   - Use browser dev tools to identify bottlenecks
   - Check network tab for slow-loading resources
   - Consider lazy loading or code splitting for large components

### Backend Issues

1. **Container Won't Start**:
   - Check Docker logs: `docker logs rembg-service`
   - Verify port availability: `netstat -tuln | grep 5000`
   - Confirm adequate system resources

2. **Out of Memory Errors**:
   - Increase container memory limit
   - Consider using a swap file if on a low-memory VPS

3. **Slow Image Processing**:
   - Check CPU utilization
   - Consider scaling horizontally with multiple instances
   - Optimize model parameters or try a lighter model

4. **Python Dependencies**:
   - Ensure exact versions from requirements.txt
   - Check for platform-specific issues with OpenCV

### Common Fixes

- **Restart Services**: Sometimes a simple restart resolves issues
  ```bash
  docker-compose restart rembg-service
  # or for supervisor
  sudo supervisorctl restart rembg
  ```

- **Clear Cache**: If image processing is inconsistent
  ```bash
  # Docker
  docker exec -it rembg-service rm -rf /app/cache/*
  # Manual
  rm -rf ./cache/*
  ```

- **Update Models**: For improved processing quality
  ```bash
  # Inside container or environment
  python -c "from rembg.u2net import download_models; download_models()"
  ```
