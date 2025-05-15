
# API Reference

This document provides a comprehensive reference for the Rembg Background Removal Microservice API.

## Base URL

```
https://your-api-domain.com
```

For local development:
```
http://localhost:5000
```

## Authentication

The API can be configured to require authentication using API keys. When enabled, include the API key in all requests:

```
X-API-Key: your-api-key-here
```

## Endpoints

### Health Check

```
GET /health
```

Checks if the service is running properly.

**Response:**
```json
{
  "status": "healthy"
}
```

**Status Codes:**
- `200 OK`: Service is running correctly

### Remove Background

```
POST /remove-bg
```

Removes the background from an uploaded image.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `image`: The image file to process (required)

**Response:**
- Content-Type: `image/png`
- Body: PNG image with transparent background

**Status Codes:**
- `200 OK`: Background successfully removed
- `400 Bad Request`: Invalid request (missing image, invalid file type, too large)
- `401 Unauthorized`: Missing or invalid API key
- `500 Internal Server Error`: Processing error

**Example Request:**
```bash
curl -X POST \
  -F "image=@path/to/image.jpg" \
  -H "X-API-Key: your-api-key-here" \
  https://your-api-domain.com/remove-bg \
  -o processed_image.png
```

### Batch Processing

```
POST /remove-bg/batch
```

Adds multiple images to the processing queue for background removal.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `images`: Array of image files to process (required)

**Response:**
```json
{
  "message": "Added 3 files to processing queue",
  "batch_id": "1621234567",
  "queued_files": ["image1.jpg", "image2.png", "image3.jpeg"]
}
```

**Status Codes:**
- `202 Accepted`: Images successfully queued
- `400 Bad Request`: Invalid request (missing images, invalid file types)
- `401 Unauthorized`: Missing or invalid API key
- `500 Internal Server Error`: Server error

### Queue Status

```
GET /queue-status/{batch_id}
```

Checks the status of a batch processing job.

**Parameters:**
- `batch_id`: The ID of the batch job (required)

**Response:**
```json
{
  "batch_id": "1621234567",
  "files": [
    {
      "filename": "image1.jpg",
      "status": "completed"
    },
    {
      "filename": "image2.png",
      "status": "processing"
    },
    {
      "filename": "image3.jpeg",
      "status": "queued"
    }
  ],
  "completed": false
}
```

**Status Codes:**
- `200 OK`: Status retrieved successfully
- `404 Not Found`: Batch ID not found
- `401 Unauthorized`: Missing or invalid API key

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

Common errors:

1. **Missing Image**:
```json
{
  "error": "No image provided"
}
```

2. **File Too Large**:
```json
{
  "error": "File too large. Maximum size: 10MB"
}
```

3. **Invalid File Type**:
```json
{
  "error": "File type not allowed. Supported types: png, jpg, jpeg, webp"
}
```

4. **Authentication Error**:
```json
{
  "error": "Unauthorized"
}
```

5. **Processing Error**:
```json
{
  "error": "Failed to process image"
}
```

## Rate Limiting

When rate limiting is enabled, the API returns the following headers:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the period
- `X-RateLimit-Remaining`: Number of requests remaining in the current period
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

If rate limit is exceeded, returns status code `429 Too Many Requests`:

```json
{
  "error": "Rate limit exceeded. Try again in 3600 seconds"
}
```

## Media Types

- Accepted input formats: `image/jpeg`, `image/png`, `image/webp`
- Output format: `image/png` with alpha transparency

## Configuration Parameters

The API behavior can be configured using environment variables:

| Parameter | Description | Default |
|-----------|-------------|---------|
| PORT | Server port | 5000 |
| MAX_FILE_SIZE | Maximum file size in MB | 10 |
| MODEL | U2Net model to use | u2net |
| API_KEY | Authentication key | None |
| RATE_LIMIT | Requests per hour | 50 |
| CACHE_DIR | Cache directory path | ./cache |
| CORS_ORIGINS | Allowed origins for CORS | * |

## Client Integration

### JavaScript Example

```javascript
async function removeBackground(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await fetch('https://your-api-domain.com/remove-bg', {
      method: 'POST',
      headers: {
        'X-API-Key': 'your-api-key-here'
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove background');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
}
```

### Python Example

```python
import requests

def remove_background(image_path, api_url, api_key=None):
    headers = {}
    if api_key:
        headers['X-API-Key'] = api_key
        
    with open(image_path, 'rb') as image_file:
        files = {'image': image_file}
        response = requests.post(api_url, files=files, headers=headers)
    
    if response.status_code == 200:
        # Save the processed image
        with open('processed_image.png', 'wb') as f:
            f.write(response.content)
        return 'processed_image.png'
    else:
        error_data = response.json()
        raise Exception(f"Error: {error_data.get('error', 'Unknown error')}")
```
