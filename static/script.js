let currentTheme = 'light';

async function submitPost() {
    const category = document.getElementById('category').value;
    const content = document.getElementById('post-content').value;

    if (!content.trim()) return;

    try {
        const response = await fetch('/post', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ category, content })
        });

        const result = await response.json();
        if (result.success) {
            loadPosts();
            document.getElementById('post-content').value = '';
            alert(`Your anonymous ID for this post is: ${result.anonymous_id}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadPosts() {
    const timeFilter = document.getElementById('time-filter').value;
    try {
        const response = await fetch(`/posts?time=${timeFilter}`);
        const posts = await response.json();
        
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = posts.map(post => `
            <div class="post">
                <div class="post-header">
                    <strong>${post.category}</strong>
                    <span class="anonymous-id">${post.anonymous_id}</span>
                </div>
                <p>${post.content}</p>
                <div class="post-actions">
                    <span>${new Date(post.timestamp).toLocaleString()}</span>
                    <div class="reactions">
                        <button onclick='react("${post.id}", "🤔")'>🤔 ${post.reactions['🤔']}</button>
                        <button onclick='react("${post.id}", "💡")'>💡 ${post.reactions['💡']}</button>
                        <button onclick='react("${post.id}", "😂")'>😂 ${post.reactions['😂']}</button>
                    </div>
                    <button onclick='openCommentModal("${post.id}")'>Comment</button>
                    <button onclick='copyShareLink("${post.id}")'>Quick Share</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function react(postId, reaction) {
    try {
        await fetch('/react', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ post_id: postId, reaction })
        });
        loadPosts();
    } catch (error) {
        console.error('Error:', error);
    }
}

function copyShareLink(postId) {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard!');
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', currentTheme);
}

async function loadAdviceOfDay() {
    try {
        const response = await fetch('/advice-of-day');
        const adviceOfDay = await response.json();
        
        const container = document.getElementById('advice-of-day');
        if (adviceOfDay) {
            container.innerHTML = `
                <h2>Advice of the Day</h2>
                <div class="advice-content">
                    <p>${adviceOfDay.content}</p>
                    <span>Category: ${adviceOfDay.category}</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    loadAdviceOfDay();
    
    // Theme persistence
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        currentTheme = 'dark';
    }
    
    document.getElementById('time-filter').addEventListener('change', loadPosts);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});