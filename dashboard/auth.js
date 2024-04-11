// Function to login user
async function loginUser(event) {
    event.preventDefault(); // Prevent form from submitting normally
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Example API call for login
    try {
        const response = await fetch('http://localhost:4000/users/login', {
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
        const response = await fetch('http://localhost:4000/users/singup', {
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
