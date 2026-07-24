import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Anchor } from '@mantine/core';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; // Adjust this path if your api.js is somewhere else!

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // FastAPI's OAuth2PasswordRequestForm expects standard form data, NOT JSON!
      const formData = new FormData();
      formData.append('username', email); // FastAPI calls it 'username', even if it's an email
      formData.append('password', password);

      // Send the request to your backend
      const response = await api.post('/auth/login', formData);

      // Save the token to local storage
      localStorage.setItem('token', response.data.access_token);

      // Force the bouncer to re-evaluate and send us to the dashboard
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login. Check your credentials.');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title c="black" ta="center" order={2}>
        Welcome back to Launch-Space!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor component={Link} to="/register" size="sm">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleLogin}>
          <TextInput 
            label="Email" 
            placeholder="you@launchspace.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput 
            label="Password" 
            placeholder="Your password" 
            required 
            mt="md" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <Text c="red" size="sm" mt="sm">{error}</Text>}
          
          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;