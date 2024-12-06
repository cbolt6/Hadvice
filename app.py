# Import statements
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS  # New import for CORS support
import os

# Initialize Flask app
app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS to allow frontend-backend communication

# Route to serve static files and index.html
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return render_template('index.html')

# Existing route example (keep this in place)
@app.route('/post', methods=['POST'])
def create_post():
    data = request.json
    # Debugging print statement
    print("Request received with data:", data)  # Helps to debug issues with received data
    now = datetime.now()
    post = {
        'id': str(uuid.uuid4()),
        'category': data['category'],
        'content': data['content'],
        'timestamp': now.isoformat(),
        'anonymous_id': generate_anonymous_id(),
        'reactions': {'🤔': 0, '💡': 0, '😂': 0},
        'comments': []
    }
    posts.insert(0, post)
    return jsonify({'success': True, 'anonymous_id': post['anonymous_id']})

# Other existing routes here...

# Run the app if it's the main module
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
