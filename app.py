import os
from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta
import uuid
import random

app = Flask(__name__)

# In-memory storage (replace with database in production)
posts = []

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
        'reactions': {'🤔': 0, '💡': 0, '😂': 0},
        'comments': []
    }
    posts.insert(0, post)
    return jsonify({'success': True, 'anonymous_id': post['anonymous_id']})

@app.route('/posts')
def get_posts():
    time_filter = request.args.get('time', 'all')
    now = datetime.now()
    
    filtered_posts = posts
    if time_filter == '24h':
        filtered_posts = [p for p in posts if now - datetime.fromisoformat(p['timestamp']) <= timedelta(hours=24)]
    elif time_filter == 'week':
        filtered_posts = [p for p in posts if now - datetime.fromisoformat(p['timestamp']) <= timedelta(weeks=1)]
    elif time_filter == 'month':
        filtered_posts = [p for p in posts if now - datetime.fromisoformat(p['timestamp']) <= timedelta(days=30)]
    
    return jsonify(filtered_posts)

@app.route('/react', methods=['POST'])
def react_to_post():
    data = request.json
    post_id = data['post_id']
    reaction = data['reaction']
    
    for post in posts:
        if post['id'] == post_id:
            post['reactions'][reaction] += 1
            return jsonify({'success': True})
    
    return jsonify({'success': False}), 404

@app.route('/comment', methods=['POST'])
def add_comment():
    data = request.json
    post_id = data['post_id']
    comment_content = data['content']
    
    for post in posts:
        if post['id'] == post_id:
            comment = {
                'id': str(uuid.uuid4()),
                'content': comment_content,
                'anonymous_id': generate_anonymous_id(),
                'timestamp': datetime.now().isoformat()
            }
            post['comments'].insert(0, comment)
            return jsonify({'success': True, 'anonymous_id': comment['anonymous_id']})
    
    return jsonify({'success': False}), 404

@app.route('/advice-of-day')
def get_advice_of_day():
    # Simple implementation: most reacted post in last 24 hours
    now = datetime.now()
    day_posts = [p for p in posts if now - datetime.fromisoformat(p['timestamp']) <= timedelta(hours=24)]
    
    if not day_posts:
        return jsonify(None)
    
    return jsonify(max(day_posts, key=lambda p: sum(p['reactions'].values())))

# The correct __main__ block should be at the bottom of the script
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
