import React, { useState, useEffect } from 'react';
import { Typography, Paper, Card, CardContent, CardHeader, Avatar, CircularProgress, Box, Grid } from '@mui/material';
import { getPosts } from '../services/api';

function TrendingPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Get popular posts (posts with the most comments)
        const data = await getPosts('popular');
        setPosts(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error in TrendingPosts component:', err);
        setError('Failed to fetch trending posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
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
          Trending Posts with Most Comments
        </Typography>
        <Typography variant="body1" align="center">
          No trending posts found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Trending Posts with Most Comments
      </Typography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} key={post.id}>
            <Card sx={{ mb: 2, height: '100%' }}>
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

export default TrendingPosts;