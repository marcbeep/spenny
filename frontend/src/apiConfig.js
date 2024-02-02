let apiUrl;

if (process.env.NODE_ENV === 'production') {
  apiUrl = process.env.REACT_APP_API_URL; 
} else {
  apiUrl = 'http://localhost:3000';
}

export default apiUrl;
