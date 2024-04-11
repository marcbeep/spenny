const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://spenny-6e54c38e0b23.herokuapp.com';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(payload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userProfilePicture', data.profilePicture);
        sessionStorage.setItem('token', data.token);

        window.location.href = 'success.html';
    } catch (error) {
        alert(error.message);
    }
}

async function signupUser(event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/users/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Signup failed');

        const data = await response.json();
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
    const token = sessionStorage.getItem('token');
    if (!token) {
        console.error('No token found, unauthorized.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch categories');

        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function displayCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    categories.forEach(category => {
        const item = document.createElement('li');
        item.textContent = category.categoryTitle;
        categoriesList.appendChild(item);
    });
}

async function addCategory(categoryTitle) {
    const token = sessionStorage.getItem('token');
    if (!token) {
        console.error('No token found, unauthorized.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: categoryTitle })
        });

        if (!response.ok) {
            // If the response is not ok, throw an error with the response status
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || 'Failed to add category');
        }

        const newCategory = await response.json();
        console.log('New Category Added:', newCategory);
        // Optionally refresh the categories list or update the UI in some other way
        fetchUserCategories(); // This will refetch categories, including the new one
    } catch (error) {
        console.error('Error adding category:', error);
        alert(error.message);
    }
}


