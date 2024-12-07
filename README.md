# Hadvice

Hadvice is a Flask-based web application that allows users to share and view advice anonymously. Users can filter advice by time range, interact with posts using reactions, and leave comments. The app includes a light/dark mode toggle and dynamically displays the "Advice of the Day."

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API Endpoints](#api-endpoints)
5. [File Structure](#file-structure)
6. [Known Issues](#known-issues)
7. [Future Enhancements](#future-enhancements)

## Features

- **Anonymous Posting:** Users can submit advice anonymously, categorized into predefined groups (Clubs, Courses, Socials, Miscellaneous).
- **Filtering by Time:** View posts filtered by "All Time," "Last Hour," "Today," or "Last Week."
- **Reactions:** Upvote or downvote posts to reflect community sentiment.
- **Comments:** Leave anonymous comments on posts.
- **Advice of the Day:** Displays the most upvoted post from the last 24 hours.
- **Dark Mode Toggle:** Switch between light and dark themes for better readability.
- **Persistence:** Posts and reactions are stored persistently using a JSON file.

## Installation

Follow these steps to set up Hadvice on your local machine:

### Prerequisites

- Python 3.7+
- Flask
- A modern web browser (e.g., Chrome, Firefox, Edge)

### Steps

1. **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2. **Set Up the Environment**
    Create a virtual environment and install the required dependencies:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install flask
    ```

3. **Run the Application**
    Start the Flask development server:
    ```bash
    python app.py
    ```

4. **Access the App**
    Open your browser and navigate to:
    ```
    http://127.0.0.1:5000
    ```

## Usage

### Submitting a Post

1. Choose a category from the dropdown menu.
2. Enter your advice in the text box.
3. Click the "Post Anonymously" button. An anonymous ID will be displayed for your post.

### Viewing Posts

1. All posts are diplayed in descending net voter value. For example 8 likes 5 dislikes will be listed below 8 likes 2 dislikes.
2. Use the time filter to select posts from "All Time," "Last Hour," "Today," or "Last Week."
3. Scroll through the posts in the **Posts Container** section.

### Reacting to Posts

1. Click 👍 to upvote or 👎 to downvote a post.
2. Reaction counts will update dynamically.

### Commenting

1. Enter a comment in the text box under a post.
2. Click the "Comment" button to submit your comment anonymously.

### Advice of the Day

The "Advice of the Day" section highlights the most upvoted post from the past 24 hours.

### Dark Mode

Toggle the theme using the "🌓 Toggle Theme" button.

## API Endpoints

### `/post` (POST)
- **Description:** Submit a new post.
- **Request Body:**
    ```json
    {
        "category": "string",
        "content": "string"
    }
    ```
- **Response:**
    ```json
    {
        "success": true,
        "anonymous_id": "PurpleFox23"
    }
    ```

### `/posts` (GET)
- **Description:** Fetch posts based on a time filter.
- **Query Parameters:** `time` (values: `all`, `hour`, `day`, `week`)
- **Response:**
    ```json
    [
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
            "comments": [
                {
                    "id": "string",
                    "content": "string",
                    "anonymous_id": "string",
                    "timestamp": "ISO 8601 string"
                }
            ]
        }
    ]
    ```

### `/react` (POST)
- **Description:** React to a post (upvote or downvote).
- **Request Body:**
    ```json
    {
        "post_id": "string",
        "reaction": "upvote" or "downvote"
    }
    ```
- **Response:**
    ```json
    {
        "success": true
    }
    ```

### `/comment` (POST)
- **Description:** Add a comment to a post.
- **Request Body:**
    ```json
    {
        "post_id": "string",
        "content": "string"
    }
    ```
- **Response:**
    ```json
    {
        "success": true,
        "anonymous_id": "PurpleWolf42"
    }
    ```

### `/advice-of-day` (GET)
- **Description:** Fetch the most upvoted post from the past 24 hours.
- **Response:**
    ```json
    {
        "id": "string",
        "category": "string",
        "content": "string",
        "reactions": {
            "upvotes": 42,
            "downvotes": 3
        }
    }
    ```

### `/clear` (POST)
- **Description:** Clear all posts and data (for testing purposes).
- **Response:**
    ```json
    {
        "success": true,
        "message": "All posts have been cleared."
    }
    ```

## File Structure
├── app.py # Backend Flask application 
├── static/ │ ├── script.js # Client-side JavaScript │ 
├── styles.css # Styling for the application 
├── templates/ │ └── index.html # HTML file for the app 
├── data.json # Persistent storage for posts 
├── README.md # Documentation for the project


## Known Issues

- Posts with invalid timestamps in `data.json` may cause filtering errors.
- The application currently uses a JSON file for storage, which is not suitable for production.

## Future Enhancements

- **Database Integration:** Replace `data.json` with a proper database like SQLite or PostgreSQL.
- **User Accounts:** Add optional user authentication for non-anonymous features.
- **Improved Filtering:** Include more robust filtering options and sorting criteria (e.g., keyword search).

Feel free to reach out if you have any questions or suggestions!

