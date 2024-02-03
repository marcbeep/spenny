const backendURL = process.env.NODE_ENV === 'production'
  ? 'https://spenny-api.reeflink.org'
  : 'http://localhost:3000'; 

export default backendURL;
