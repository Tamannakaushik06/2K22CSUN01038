import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Tabs, Tab } from '@mui/material';
import TopUsers from './pages/TopUsers';
import TrendingPosts from './pages/TrendingPosts';
import Feed from './pages/Feed';
import './App.css';

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Social Media Analytics
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 2 }}>
          <Tabs value={value} onChange={handleChange} centered>
            <Tab label="Top Users" component={Link} to="/" />
            <Tab label="Trending Posts" component={Link} to="/trending" />
            <Tab label="Latest Feed" component={Link} to="/feed" />
          </Tabs>
        </Box>
        
        <Routes>
          <Route path="/" element={<TopUsers />} />
          <Route path="/trending" element={<TrendingPosts />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;