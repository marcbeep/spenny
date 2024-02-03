const backendURL = process.env.NODE_ENV === 'production'
  ? 'https://spenny-6e54c38e0b23.herokuapp.com'
  : 'http://localhost:3000'; 

export default backendURL;
