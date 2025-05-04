import React, { useState, useEffect } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, CircularProgress, Box } from '@mui/material';
import { getTopUsers } from '../services/api';

function TopUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getTopUsers();
        setUsers(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching top users:', err);
        setError('Failed to fetch top users. Please try again later.');
        setLoading(false);
      }
    };

    fetchUsers();
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

  if (!users || users.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Top Users with Most Commented Posts
        </Typography>
        <Typography variant="body1" align="center">
          No users found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Top Users with Most Commented Posts
      </Typography>
      <List>
        {users.map((user, index) => (
          <React.Fragment key={user.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar 
                  alt={user.name} 
                  src={`https://source.unsplash.com/random/100x100?sig=${user.id}`} 
                />
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      Total Comments: {user.totalComments}
                    </Typography>
                    {` — Posts: ${user.postsCount}`}
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < users.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}

export default TopUsers;