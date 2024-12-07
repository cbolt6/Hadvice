import os
import json
from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta
import uuid
import random

app = Flask(__name__)

# File to store posts persistently
DATA_FILE = 'data.json'

# Load existing data or initialize an empty list
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'r') as f:
        posts = json.load(f)
else:
    posts = []

# Save data to the file
def save_data():
    with open(DATA_FILE, 'w') as f:
        json.dump(posts, f)

# Generate a random anonymous ID
def generate_anonymous_id():
    adjectives = ['Purple', 'Blue', 'Green', 'Red', 'Silver', 'Golden']
    animals = ['Fox', 'Wolf', 'Eagle', 'Lion', 'Shark', 'Owl']
    number = random.randint(10, 99)
    return f"{random.choice(adjectives)}{random.choice(animals)}{number}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/post', methods=['POST'])
def create_post():
    data = request.json
    now = datetime.now()
    post = {
        'id': str(uuid.uuid4()),
        'category': data['category'],
        'content': data['content'],
        'timestamp': now.isoformat(),
        'anonymous_id': generate_anonymous_id(),
        'reactions': {'upvotes': 0, 'downvotes': 0},
        'comments': []
    }
    posts.insert(0, post)  # Add the new post to the top
    save_data()  # Save updated data
    return jsonify({'success': True, 'anonymous_id': post['anonymous_id']})

@app.route('/posts')
def get_posts():
    time_filter = request.args.get('time', 'all')
    print(f"Time filter received: {time_filter}")  # Log time filter
    now = datetime.now()
    filtered_posts = posts

    # Filter posts based on time range
    if time_filter == 'hour':
        filtered_posts = [p for p in posts if now - datetime.fromisoformat(p['timestamp']) <= timedelta(hours=1)]
    elif time_filter == 'day':
        filtered_posts = [p for p in posts if now - datetime.fromisoformat(p['timestamp']) <= timedelta(days=1)]
    elif time_filter == 'week':
        filtered_posts = [p for p in posts if now - datetime.fromisoformat(p['timestamp']) <= timedelta(weeks=1)]

    # Log the filtered posts
    print(f"Filtered posts ({len(filtered_posts)}): {filtered_posts}")

    # Sort posts by timestamp (most recent first)
    filtered_posts.sort(key=lambda p: datetime.fromisoformat(p['timestamp']), reverse=True)
    return jsonify(filtered_posts)

@app.route('/react', methods=['POST'])
def react_to_post():
    data = request.json
    post_id = data['post_id']
    reaction = data['reaction']

    # Find the post by ID and update the reactions
    for post in posts:
        if post['id'] == post_id:
            if reaction == 'upvote':
                post['reactions']['upvotes'] += 1
            elif reaction == 'downvote':
                post['reactions']['downvotes'] += 1
            save_data()  # Save updated data
            return jsonify({'success': True})

    return jsonify({'success': False}), 404

@app.route('/comment', methods=['POST'])
def add_comment():
    data = request.json
    post_id = data['post_id']
    content = data['content']

    # Find the post by ID and add the comment
    for post in posts:
        if post['id'] == post_id:
            comment = {
                'id': str(uuid.uuid4()),
                'content': content,
                'anonymous_id': generate_anonymous_id(),
                'timestamp': datetime.now().isoformat()
            }
            post['comments'].append(comment)
            save_data()  # Save updated data
            return jsonify({'success': True, 'anonymous_id': comment['anonymous_id']})

    return jsonify({'success': False}), 404

@app.route('/advice-of-day')
def get_advice_of_day():
    now = datetime.now()
    # Get posts from the last 24 hours
    day_posts = [p for p in posts if now - datetime.fromisoformat(p['timestamp']) <= timedelta(days=1)]

    if not day_posts:
        print("No posts found in the last 24 hours.")
        return jsonify(None)
    
    # Select the post with the highest upvotes
    most_liked_post = max(day_posts, key=lambda p: p['reactions']['upvotes'], default=None)
    print(f"Most liked post: {most_liked_post}")
    return jsonify(most_liked_post)

@app.route('/clear', methods=['POST'])
def clear_data():
    global posts
    posts = []
    save_data()
    return jsonify({'success': True, 'message': 'All posts have been cleared.'})

# Run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
