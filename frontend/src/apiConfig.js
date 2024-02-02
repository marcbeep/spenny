let apiUrl;

if (process.env.NODE_ENV === 'production') {
  apiUrl = process.env.API_URL; 
} else {
  apiUrl = 'http://localhost:3000';
}

export default apiUrl;
