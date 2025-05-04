import React, { useState, useEffect } from 'react';
import { Typography, Paper, Card, CardContent, CardHeader, Avatar, CircularProgress, Box, Grid } from '@mui/material';
import { getPosts } from '../services/api';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch the latest posts
  const fetchLatestPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts('latest');
      setPosts(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error in Feed component:', err);
      setError('Failed to fetch latest posts. Please try again later.');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLatestPosts();

    // Set up polling for new posts every 30 seconds
    const intervalId = setInterval(() => {
      fetchLatestPosts();
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading && posts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && posts.length === 0) {
    return (
      <Typography color="error" align="center" variant="h6">
        {error}
      </Typography>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Latest Posts
        </Typography>
        <Typography variant="body1" align="center">
          No posts found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Latest Posts
        </Typography>
        {loading && (
          <CircularProgress size={24} />
        )}
      </Box>
      
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card sx={{ mb: 2 }}>
              <CardHeader
                avatar={
                  <Avatar 
                    alt={post.userName} 
                    src={`https://source.unsplash.com/random/100x100?sig=${post.id}`} 
                  />
                }
                title={post.userName || `User ${post.userId}`}
                subheader={`Post ID: ${post.id} | Comments: ${post.commentsCount || 0}`}
              />
              <CardContent>
                <Typography variant="body1">
                  {post.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export default Feed;