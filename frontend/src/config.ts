console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All env vars:', import.meta.env);

const config = {
  apiUrl: 'http://localhost:5000', // Temporarily hardcoded for debugging
};

console.log('Final config:', config);

export default config;
