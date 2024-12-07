let isDarkMode = false;

// Toggle between light and dark themes
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    isDarkMode = !isDarkMode;
});

// Function to submit a new post
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
            loadPosts(); // Reload posts after submission
            document.getElementById('post-content').value = ''; // Clear the input field
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
        console.log(`Fetching posts with time filter: ${timeFilter}`);
        const response = await fetch(`/posts?time=${timeFilter}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const posts = await response.json();
        console.log('Fetched posts:', posts); // Log the fetched posts

        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = ''; // Clear old posts

        if (posts.length > 0) {
            postsContainer.innerHTML = posts.map(post => `
                <div class="post">
                    <div class="post-header">
                        <strong>${post.category}</strong>
                        <span class="anonymous-id">${post.anonymous_id}</span>
                    </div>
                    <p>${post.content}</p>
                    <div class="post-actions">
                        <span>${new Date(post.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })}</span>
                        <div class="reactions">
                            <button class="thumbs-up" onclick='react("${post.id}", "upvote")'>👍 ${post.reactions.upvotes}</button>
                            <button class="thumbs-down" onclick='react("${post.id}", "downvote")'>👎 ${post.reactions.downvotes}</button>
                        </div>
                    </div>
                    <div class="comments-section">
                        <textarea placeholder="Leave a comment..." id="comment-${post.id}"></textarea>
                        <button onclick='submitComment("${post.id}")'>Comment</button>
                        <div class="comments">
                            ${post.comments.map(comment => `
                                <div class="comment">
                                    <p>${comment.content}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            postsContainer.innerHTML = '<p>No posts available for the selected time filter.</p>';
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

// Function to handle reactions (thumbs up or thumbs down) for posts
async function react(postId, reactionType) {
    try {
        const response = await fetch('/react', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, reaction: reactionType })
        });

        if (response.ok) {
            loadPosts(); // Reload posts to update reactions
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to submit a comment for a specific post
async function submitComment(postId) {
    const content = document.getElementById(`comment-${postId}`).value;

    if (!content.trim()) {
        alert("Please write something before commenting.");
        return;
    }

    try {
        const response = await fetch('/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, content })
        });

        if (response.ok) {
            loadPosts(); // Reload posts to include the new comment
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to load the "Advice of the Day" section
async function loadAdviceOfTheDay() {
    try {
        console.log("Fetching advice of the day...");
        const response = await fetch('/advice-of-day');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const advice = await response.json();
        console.log('Advice of the Day:', advice); // Debug log for advice

        const adviceSection = document.getElementById('advice-of-day');

        if (advice) {
            adviceSection.innerHTML = `
                <h2>Advice of the Day</h2>
                <p><strong>${advice.category}:</strong> ${advice.content}</p>
                <p><em>👍 ${advice.reactions.upvotes} upvotes</em></p>
            `;
        } else {
            adviceSection.innerHTML = `
                <h2>Advice of the Day</h2>
                <p>No advice available from the last 24 hours.</p>
            `;
        }
    } catch (error) {
        console.error('Error fetching advice of the day:', error);
        const adviceSection = document.getElementById('advice-of-day');
        adviceSection.innerHTML = `
            <h2>Advice of the Day</h2>
            <p>Error loading advice. Please try again later.</p>
        `;
    }
}

// Initialize the page by loading posts when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    loadAdviceOfTheDay(); // Fetch and display the "Advice of the Day"
});

