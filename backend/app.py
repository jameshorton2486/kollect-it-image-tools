
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import os
import time
import threading
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
UPLOAD_FOLDER = '/tmp/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Simple in-memory queue for demonstration
# In production, use a proper queue system like Redis or RabbitMQ
processing_queue = []
queue_lock = threading.Lock()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"}), 200

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    """Remove background from an image"""
    
    # Check if a file was uploaded
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files['image']
    
    # Check if the file is valid
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
        
    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not allowed. Supported types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
    
    if file and allowed_file(file.filename):
        # Read the image
        input_data = file.read()
        
        # Check file size
        if len(input_data) > MAX_FILE_SIZE:
            return jsonify({"error": f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"}), 400
            
        try:
            # Process the image with rembg
            output_data = remove(input_data)
            
            # Return the processed image
            return send_file(
                io.BytesIO(output_data),
                mimetype='image/png',
                as_attachment=True,
                download_name=f"{secure_filename(file.filename).rsplit('.', 1)[0]}-nobg.png"
            )
        except Exception as e:
            app.logger.error(f"Error processing image: {e}")
            return jsonify({"error": "Failed to process image"}), 500
    
    return jsonify({"error": "Invalid file"}), 400

@app.route('/remove-bg/batch', methods=['POST'])
def batch_remove_background():
    """Add multiple images to processing queue"""
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400
        
    files = request.files.getlist('images')
    
    batch_id = str(int(time.time()))
    queued_files = []
    
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, f"{batch_id}_{filename}")
            file.save(file_path)
            
            with queue_lock:
                processing_queue.append({
                    'file_path': file_path,
                    'original_name': filename,
                    'batch_id': batch_id,
                    'status': 'queued'
                })
            
            queued_files.append(filename)
    
    if not queued_files:
        return jsonify({"error": "No valid files provided"}), 400
        
    return jsonify({
        "message": f"Added {len(queued_files)} files to processing queue",
        "batch_id": batch_id,
        "queued_files": queued_files
    }), 202

@app.route('/queue-status/<batch_id>', methods=['GET'])
def queue_status(batch_id):
    """Check status of batch processing"""
    batch_files = []
    
    with queue_lock:
        for item in processing_queue:
            if item['batch_id'] == batch_id:
                batch_files.append({
                    'filename': item['original_name'],
                    'status': item['status']
                })
    
    if not batch_files:
        return jsonify({"error": "Batch not found"}), 404
        
    return jsonify({
        "batch_id": batch_id,
        "files": batch_files,
        "completed": all(item['status'] == 'completed' for item in batch_files)
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
