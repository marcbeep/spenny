const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://spenny-6e54c38e0b23.herokuapp.com';

// Function to login user
async function loginUser(event) {
    event.preventDefault(); // Prevent form from submitting normally
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Example API call for login
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        // Store user data in sessionStorage
        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userProfilePicture', data.profilePicture);
        
        window.location.href = 'success.html'; // Redirect to success page
    } catch (error) {
        alert(error.message);
    }
}

// Function to sign up user
async function signupUser(event) {
    event.preventDefault(); // Prevent form from submitting normally
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Example API call for signup
    try {
        const response = await fetch(`${API_URL}/users/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) throw new Error('Signup failed');
        
        const data = await response.json();
        // Store user data in sessionStorage
        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userProfilePicture', data.profilePicture);
        
        window.location.href = 'success.html'; // Redirect to success page
    } catch (error) {
        alert(error.message);
    }
}

// Function to logout user
function logoutUser() {
    // Clear all stored data from sessionStorage
    sessionStorage.clear();

    // Redirect to the index.html page
    window.location.href = 'index.html';
}

