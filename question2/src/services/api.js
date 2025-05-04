import axios from 'axios';

// Point to our backend server, not directly to the evaluation service
const API_URL = 'http://localhost:3001/api';

// Create an axios instance for making API calls
const apiClient = axios.create({
  baseURL: API_URL
});

// Get all users
export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get posts for a specific user
export const getUserPosts = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/posts`);
    return response.data.posts;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    throw error;
  }
};

// Get comments for a specific post
export const getPostComments = async (postId) => {
  try {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data.comments;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
};

// Get top users
export const getTopUsers = async () => {
  try {
    const response = await apiClient.get('/top-users');
    return response.data.topUsers;
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw error;
  }
};

// Get posts by type (popular or latest)
export const getPosts = async (type = 'popular') => {
  try {
    const response = await apiClient.get(`/posts?type=${type}`);
    return response.data.posts;
  } catch (error) {
    console.error(`Error fetching ${type} posts:`, error);
    throw error;
  }
};