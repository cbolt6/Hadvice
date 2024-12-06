document.addEventListener('DOMContentLoaded', () => {
    loadAdviceOfDay();
    loadPosts();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });
});

async function loadAdviceOfDay() {
    const response = await fetch('/advice-of-day');
    const advice = await response.json();
    document.getElementById('advice-content').textContent = advice ? advice.content : "No advice available.";
}

async function loadPosts() {
    const filter = document.getElementById('time-filter').value;
    const response = await fetch(`/posts?time=${filter}`);
    const posts = await response.json();

    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = posts.map(post => `
        <div class="post">
            <h3>${post.category}</h3>
            <p>${post.content}</p>
            <button onclick="vote('${post.id}', 'up')">👍 ${post.upvotes}</button>
            <button onclick="vote('${post.id}', 'down')">👎 ${post.downvotes}</button>
            <button onclick="reply('${post.id}')">Reply</button>
            <div id="replies-${post.id}"></div>
        </div>
    `).join('');
}

async function vote(postId, type) {
    await fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, vote_type: type })
    });
    loadPosts();
}
