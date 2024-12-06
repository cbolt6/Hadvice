async function submitPost() {
    const category = document.getElementById('category').value;
    const content = document.getElementById('post-content').value;

    if (!content.trim()) {
        alert("Please write something before posting.");
        return;
    }

    try {
        const response = await fetch('/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, content })
        });

        const result = await response.json();
        if (result.success) {
            loadPosts(); // Reload the posts
            document.getElementById('post-content').value = '';
            alert(`Your anonymous ID for this post is: ${result.anonymous_id}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error posting. Please try again later.');
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
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});
