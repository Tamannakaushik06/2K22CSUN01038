const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const BASE_URL = 'http://20.244.56.144/evaluation-service';
const PORT = process.env.PORT || 3001;

// Authentication data
const authData = {
  email: "tamannakaushik06@gmail.com",
  name: "tamanna",
  rollNo: "2k22csun01038",
  accessCode: "hFhJhm",
  clientID: "af90fd4d-d588-4c11-94fa-df1562c919c5",
  clientSecret: "VQtPjJPbtyXbBNtv"
};

let authToken = null;
let tokenExpiry = null;

// Authentication function
const getAuthToken = async () => {
  try {
    // Check if token exists and is not expired
    if (authToken && tokenExpiry && new Date() < tokenExpiry) {
      return authToken;
    }
    
    console.log("Getting new auth token...");
    const response = await axios.post(`${BASE_URL}/auth`, authData);
    
    // Extract token correctly from response
    // The API returns token_type and access_token as you showed in your example
    const { token_type, access_token, expires_in } = response.data;
    
    // Store just the access_token part
    authToken = access_token;
    
    // Set token expiry using expires_in from response if available
    const expirySeconds = expires_in || 3600; // Default to 1 hour if not provided
    tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expirySeconds);
    
    return authToken;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw new Error('Authentication failed');
  }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = await getAuthToken();
    req.authToken = token;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Get all users
app.get('/api/users', authenticate, async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${req.authToken}` }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get posts by user ID
app.get('/api/users/:userId/posts', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
      headers: { Authorization: `Bearer ${req.authToken}` }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get comments for a post
app.get('/api/posts/:postId/comments', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const response = await axios.get(`${BASE_URL}/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${req.authToken}` }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get top users (users with most commented posts)
app.get('/api/top-users', authenticate, async (req, res) => {
  try {
    // Get all users
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${req.authToken}` }
    });
    const users = usersResponse.data.users;
    
    // For each user, get their posts and count comments
    const userStats = await Promise.all(Object.entries(users).map(async ([userId, userName]) => {
      try {
        const postsResponse = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
          headers: { Authorization: `Bearer ${req.authToken}` }
        });
        
        const posts = postsResponse.data.posts || [];
        let totalComments = 0;
        
        // For each post, get comments count
        await Promise.all(posts.map(async (post) => {
          try {
            const commentsResponse = await axios.get(`${BASE_URL}/posts/${post.id}/comments`, {
              headers: { Authorization: `Bearer ${req.authToken}` }
            });
            const comments = commentsResponse.data.comments || [];
            totalComments += comments.length;
          } catch (err) {
            console.error(`Error fetching comments for post ${post.id}:`, err.message);
          }
        }));
        
        return {
          id: userId,
          name: userName,
          totalComments,
          postsCount: posts.length
        };
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err.message);
        return {
          id: userId,
          name: userName,
          totalComments: 0,
          postsCount: 0
        };
      }
    }));
    
    // Sort by total comments and return top 5
    const topUsers = userStats
      .sort((a, b) => b.totalComments - a.totalComments)
      .slice(0, 5);
    
    res.json({ topUsers });
  } catch (error) {
    console.error('Error calculating top users:', error.message);
    res.status(500).json({ error: 'Failed to calculate top users' });
  }
});

// Get posts by type (popular or latest)
app.get('/api/posts', authenticate, async (req, res) => {
  try {
    const { type = 'popular' } = req.query;
    
    // Get all users
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${req.authToken}` }
    });
    const users = usersResponse.data.users;
    
    // Get all posts from all users
    let allPosts = [];
    await Promise.all(Object.keys(users).map(async (userId) => {
      try {
        const postsResponse = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
          headers: { Authorization: `Bearer ${req.authToken}` }
        });
        
        const userPosts = (postsResponse.data.posts || []).map(post => ({
          ...post,
          userName: users[userId]
        }));
        
        allPosts = [...allPosts, ...userPosts];
      } catch (err) {
        console.error(`Error fetching posts for user ${userId}:`, err.message);
      }
    }));
    
    // For each post, get comments count
    const postsWithComments = await Promise.all(allPosts.map(async (post) => {
      try {
        const commentsResponse = await axios.get(`${BASE_URL}/posts/${post.id}/comments`, {
          headers: { Authorization: `Bearer ${req.authToken}` }
        });
        const comments = commentsResponse.data.comments || [];
        
        return {
          ...post,
          commentsCount: comments.length,
          timestamp: post.id // Using ID as a proxy for timestamp since we don't have actual timestamps
        };
      } catch (err) {
        console.error(`Error fetching comments for post ${post.id}:`, err.message);
        return {
          ...post,
          commentsCount: 0,
          timestamp: post.id
        };
      }
    }));
    
    let result;
    if (type === 'popular') {
      // Sort by comments count (descending)
      result = postsWithComments.sort((a, b) => b.commentsCount - a.commentsCount);
      
      // If there are posts with the same max comment count, include all of them
      if (result.length > 0) {
        const maxComments = result[0].commentsCount;
        result = result.filter(post => post.commentsCount === maxComments);
      }
    } else if (type === 'latest') {
      // Sort by ID (descending) assuming higher IDs are newer posts
      result = postsWithComments
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    } else {
      // Default case
      result = postsWithComments;
    }
    
    res.json({ posts: result });
  } catch (error) {
    console.error(`Error fetching ${req.query.type || 'all'} posts:`, error.message);
    res.status(500).json({ error: `Failed to fetch ${req.query.type || 'all'} posts` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});