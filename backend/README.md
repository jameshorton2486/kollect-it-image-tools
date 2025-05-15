
# Rembg Background Removal Microservice

This is a lightweight Flask API for removing backgrounds from images using the Rembg library.

## Setup Instructions

### Prerequisites

- Python 3.8+
- Docker (optional but recommended)

### Installation

#### Option 1: Docker (Recommended)

1. Build the Docker image:
```bash
docker build -t rembg-service .
```

2. Run the container:
```bash
docker run -p 5000:5000 rembg-service
```

#### Option 2: Local Python Environment

1. Install the required packages:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python app.py
```

### Usage

The service will be available at `http://localhost:5000/remove-bg`. Configure the frontend to point to this URL.

## API Endpoint

### POST /remove-bg

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `image`: The image file to process

**Response:**
- Content-Type: image/png
- Body: PNG image with transparent background

## Configuration

- `MAX_FILE_SIZE`: Maximum allowed file size in MB (default: 10MB)
- `MODEL`: U2Net model to use (default: u2net)

## Deploying to Production

For production deployment, consider:
1. Adding proper authentication
2. Setting up a reverse proxy (Nginx, Apache, etc.)
3. Using a process manager (Gunicorn, uWSGI, etc.)
4. Configuring proper CORS settings

### Minimal Server Requirements

- 2GB RAM (4GB recommended)
- 2 CPU cores
- 5GB disk space

## Processing Queue

For batch operations, the service uses a simple queue system. For more advanced needs, consider implementing:

1. Redis-backed queue system
2. Worker pools for parallel processing

## Monitoring

Add monitoring for:
- Request rates
- Processing times
- Error rates
- Resource utilization
