const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://spenny-6e54c38e0b23.herokuapp.com';

function displayList(elementId, items, formatter) {
    const listElement = document.getElementById(elementId);
    if (!listElement) {
        console.error('List element not found:', elementId);
        return;
    }
    listElement.innerHTML = ''; // Clear existing content
    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = formatter(item); // Use formatter function to get display text
        listElement.appendChild(listItem);
    });
}

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

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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


async function signupUser(event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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
        displayList('categoriesList', categories, category => 
            `${category.categoryTitle} - Available: £${category.categoryAvailable}`);
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

async function fetchSingleCategory(categoryId) {
    try {
        const category = await makeFetchRequest(`/categories/${categoryId}`);
        console.log('Fetched Category:', category);
    } catch (error) {
        console.error('Error fetching single category:', error);
    }
}

async function updateCategory(categoryId, newTitle) {
    try {
        const updatedCategory = await makeFetchRequest(`/categories/${categoryId}`, {
            method: 'PATCH',
            body: JSON.stringify({ title: newTitle }),
        });

        console.log('Updated Category:', updatedCategory);
        fetchUserCategories(); // Optionally refresh the categories list to reflect the update
    } catch (error) {
        alert(error.message);
    }
}

async function deleteCategory(categoryId, newCategoryId) {
    try {
        await makeFetchRequest(`/categories/${categoryId}`, {
            method: 'DELETE',
            body: JSON.stringify({ newCategoryId }),
        });

        console.log(`Category ${categoryId} deleted.`);
        fetchUserCategories(); // Refresh categories list to reflect the deletion
    } catch (error) {
        alert(error.message);
    }
}

