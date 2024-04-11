const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://spenny-6e54c38e0b23.herokuapp.com';

// Base fetch function to handle common fetch logic
async function makeFetchRequest(path, options = {}) {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || `${response.status}: ${response.statusText}`);
        }

        return response.json(); // Assuming all responses are expected to be JSON
    } catch (error) {
        console.error('Fetch request failed:', error);
        throw error; // Re-throw to allow specific function handling
    }
}

async function loginUser(email, password) {
    try {
        const data = await makeFetchRequest('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userProfilePicture', data.profilePicture);
        sessionStorage.setItem('token', data.token);

        window.location.href = 'success.html';
    } catch (error) {
        alert(error.message);
    }
}

async function signupUser(email, password) {
    try {
        const data = await makeFetchRequest('/users/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userProfilePicture', data.profilePicture);
        sessionStorage.setItem('token', data.token);

        window.location.href = 'success.html';
    } catch (error) {
        alert(error.message);
    }
}

function logoutUser() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

async function fetchUserCategories() {
    try {
        const categories = await makeFetchRequest('/categories');
        displayCategories(categories); // Ensure this function is defined or handled appropriately
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function addCategory(categoryTitle) {
    try {
        const newCategory = await makeFetchRequest('/categories', {
            method: 'POST',
            body: JSON.stringify({ title: categoryTitle }),
        });

        console.log('New Category Added:', newCategory);
        fetchUserCategories(); // Refresh categories list
    } catch (error) {
        alert(error.message);
    }
}
