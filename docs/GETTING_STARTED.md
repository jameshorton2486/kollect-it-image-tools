
# Getting Started Guide

This guide will help you set up and run both the frontend application and the Rembg background removal microservice for local development.

## Frontend Setup

### Prerequisites
- Node.js (version 16 or later)
- npm (version 7 or later) or equivalent package manager

### Installation Steps

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd kollect-it-image-tools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

### Configuration

For local development, you can create a `.env.local` file in the project root:

```
# API Configuration for local development
VITE_DEFAULT_REMBG_URL=http://localhost:5000/remove-bg

# Feature Flags
VITE_ENABLE_BACKGROUND_REMOVAL=true
VITE_ENABLE_IMAGE_CACHING=true
```

## Rembg Microservice Setup

### Option 1: Docker (Recommended)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and run the Docker container:
   ```bash
   docker build -t rembg-service .
   docker run -p 5000:5000 rembg-service
   ```

3. Test the service:
   ```bash
   curl -X GET http://localhost:5000/health
   ```

### Option 2: Local Python Environment

1. Ensure you have Python 3.8+ installed:
   ```bash
   python --version
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask application:
   ```bash
   python app.py
   ```

6. The service will be available at:
   ```
   http://localhost:5000
   ```

### Testing the Microservice

You can test the background removal service using curl:

```bash
curl -X POST -F "image=@path/to/test/image.jpg" http://localhost:5000/remove-bg -o output.png
```

Or use any API testing tool like Postman with the following configuration:
- Method: POST
- URL: http://localhost:5000/remove-bg
- Body: form-data with key "image" containing your image file

## Development Workflow

1. Make changes to the frontend code
2. Changes will be automatically reflected in the development server
3. For backend changes, restart the Flask app or rebuild the Docker container
4. Use the application in your browser to test image processing features

## Troubleshooting

### Common Frontend Issues

- **Module not found errors**:
  ```bash
  npm install
  ```

- **Port conflicts**:
  Change the port in `vite.config.ts`:
  ```typescript
  server: {
    port: 3000, // Change from default 8080
  }
  ```

### Common Backend Issues

- **Missing dependencies**:
  ```bash
  pip install -r requirements.txt
  ```

- **Model download failing**:
  Manually download models:
  ```bash
  python -c "from rembg.u2net import download_models; download_models()"
  ```

- **Port conflicts**:
  Change the port in `app.py`:
  ```python
  app.run(host='0.0.0.0', port=5001)  # Change from default 5000
  ```

## Next Steps

- Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment instructions
- Explore additional configuration options in the backend README
- Contribute to the project by following our contribution guidelines
