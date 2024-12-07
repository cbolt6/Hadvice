# DESIGN.md

## Overview

Hadvice is a Flask-based web application designed to provide users with an anonymous platform to share, engage with, and view advice. The app allows users to post advice in predefined categories, interact with posts via reactions and comments, and view the "Advice of the Day," which highlights the most upvoted advice from the past 24 hours. The posts are ranked dynamically by their net value (upvotes minus downvotes), ensuring the most impactful advice is prioritized for visibility.

The application incorporates a time filter feature, enabling users to view advice from specific periods (e.g., the last hour, day, or week). This design document outlines the architecture, key features, design decisions, and scalability considerations.

Hadvice prioritizes simplicity and usability, using Flask for the backend and a combination of HTML, CSS, and JavaScript for the front end. A JSON file is used for data storage during the prototyping stage, with plans for database integration in future iterations.

---

## Architecture

The Hadvice application follows a **Model-View-Controller (MVC)** architecture to organize code efficiently and separate concerns.

### 1. **Model**
- The **data model** consists of a JSON file (`data.json`) that stores all posts, comments, and reactions persistently.
- Each post is represented as a dictionary with attributes such as:
    ```json
    {
        "id": "string",
        "category": "string",
        "content": "string",
        "timestamp": "ISO 8601 string",
        "anonymous_id": "string",
        "reactions": {
            "upvotes": 0,
            "downvotes": 0
        },
        "comments": []
    }
    ```
-Posts are sorted by net value (upvotes - downvotes) and timestamp. This ensures that advice with higher engagement appears at the top, within the selected time range.
- JSON was chosen for its human-readable format and ease of debugging during the development phase. It allows for rapid iteration without the overhead of setting up a database.
- However, JSON lacks concurrency control and is not optimized for scalability. Transitioning to a relational database is a planned enhancement.

### 2. **View**
- The front-end consists of an interactive HTML interface styled with CSS for a clean and responsive design.
- JavaScript powers dynamic updates to the DOM, enabling real-time interaction with minimal latency.
- Flask’s `render_template` function is used to serve the main HTML page (`index.html`).
  Key components of the UI include: A post submission form. A posts container dynamically populated with posts. A net ranking score of each post appearing in descending order. A time filter dropdown to filter posts by range. A dark mode toggle for accessibility.


### 3. **Controller**
- Flask handles routing and server-side logic, processing user actions via a RESTful API.
- All requests and responses are JSON-based, ensuring compatibility and ease of testing.

---

## Key Components

### 1. **Backend**
The backend is implemented in Flask, providing an efficient and lightweight framework for routing and server-side logic.

#### **Core Endpoints**
- **`GET /`**: Serves the front-end interface by rendering `index.html`. Sorts the filtered posts by net value (upvotes - downvotes) in descending order, with ties resolved by timestamp (most recent first).
- **`POST /post`**: Accepts new posts, validates inputs, generates an `anonymous_id`, and saves the post to the JSON file.
- - **`GET /posts`**: Retrieves posts filtered by a time range (`all`, `hour`, `day`, `week`) and sorts them by net value (upvotes - downvotes) in descending order, with ties resolved by timestamp.
- **`POST /react`**: Updates reaction counts (upvotes or downvotes) for a specific post.
- **`POST /comment`**: Adds a comment to a specific post.
- **`GET /advice-of-day`**: Identifies and returns the most upvoted post from the past 24 hours.

#### **Error Handling**
- Robust error handling ensures that invalid inputs or missing parameters do not crash the server.
- Example: If a required field is missing in a `POST /post` request, the API responds with:
    ```json
    {
        "success": false,
        "error": "Content cannot be empty"
    }
    ```

#### **Persistence**
- Posts and metadata are written to and read from `data.json`. Updates to the file are handled using a `save_data` function to ensure consistency:
    ```python
    def save_data():
        with open(DATA_FILE, 'w') as f:
            json.dump(posts, f, indent=4)
    ```

---

### 2. **Front-End**
The front-end interface provides users with an intuitive and responsive way to interact with the application.

#### **HTML and CSS**
- The HTML layout includes:
    - A form for submitting advice.
    - A dynamically populated container for displaying posts.
    - A dropdown filter for time ranges.
    - A theme toggle button (light/dark mode).
- CSS is used to create a visually appealing interface, with styles for both themes:
    ```css
    body.dark-theme {
        background-color: #121212;
        color: #f4f4f4;
    }
    ```

#### **JavaScript**
- JavaScript is responsible for:
    - Submitting new posts via `fetch` requests.
    - Updating the DOM dynamically when posts, reactions, or comments are added.
    - Toggling between light and dark themes.
- Example: Submitting a post:
    ```javascript
    async function submitPost() {
        const response = await fetch('/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, content })
        });
        const result = await response.json();
        if (result.success) loadPosts(); // Refresh posts
    }
    ```

#### **Dynamic Features**
- **Reactions**: Users can upvote or downvote posts using buttons, and the updated counts are displayed immediately.
- **Comments**: Each post has a comment section, where users can leave anonymous feedback.

---

### 3. **Data Filtering and Advice of the Day**
- Ranking: Filtered posts are ranked by net value, ensuring the most engaging advice appears at the top. Filtering happens first, followed by sorting.
- Posts are filtered based on their timestamps using Python’s `datetime` module.
- "Advice of the Day" is calculated by identifying the post with the highest upvotes in the past 24 hours:
    ```python
    most_liked_post = max(day_posts, key=lambda p: p['reactions']['upvotes'])
    ```

---

## Design Decisions

### 1. **JSON File for Storage**
- **Reasoning:** A JSON file was chosen for its simplicity and ease of debugging during development.
- **Limitations:** JSON is not suitable for concurrent writes or large-scale applications. Transitioning to a database is recommended for scalability.

### 2. **RESTful API**
- **Reasoning:** A RESTful design ensures modularity and compatibility with any front-end framework.
- **Impact:** The API structure allows easy integration with additional features or external applications.

### 3. **Light/Dark Theme Toggle**
- **Reasoning:** Enhances accessibility and user satisfaction by accommodating preferences for dark mode.
- **Implementation:** A CSS class (`dark-theme`) is toggled using JavaScript, dynamically changing styles.

### 4. **Anonymous Identifiers**
- **Reasoning:** Adding randomized `anonymous_id`s (e.g., `BlueOwl23`) enhances the user experience by providing identity without compromising anonymity.

---

## Challenges and Resolutions

1. **Concurrent Writes to JSON**
    - **Challenge:** Simultaneous writes to `data.json` could lead to data corruption.
    - **Resolution:** Used a single-threaded Flask development server and planned future migration to a database.

2. **Dynamic Filtering**
    - **Challenge:** Correctly filtering posts by time ranges required consistent timestamp parsing.
    - **Resolution:** Used Python’s `datetime.fromisoformat` to ensure reliable conversions.

3. **Scalability**
    - **Challenge:** JSON storage is not scalable for high-volume applications.
    - **Resolution:** Designed the system to easily transition to a database like PostgreSQL.

---

## Future Enhancements

1. **Database Integration**
    - Transition to SQLite or PostgreSQL for scalable and concurrent data storage.

2. **Real-Time Updates**
    - Use WebSockets for real-time updates to posts, reactions, and comments without requiring page reloads.

3. **Authentication**
    - Add optional user accounts for features like saving posts or tracking personal activity.

4. **Advanced Filtering**
    - Enable keyword search and more complex sorting options.

---

## Conclusion
Hadvice demonstrates the power of simplicity in design while leaving room for future scalability. Its Flask-based backend, dynamic JavaScript front-end, and modular API structure make it an excellent prototype for a fully-featured application. By focusing on user engagement and accessibility, Hadvice creates a seamless experience for anonymous advice sharing.
