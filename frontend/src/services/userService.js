export const userService = {
  async getUsers() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No hay authToken. Claves en localStorage:', Object.keys(localStorage));
      throw new Error('No autenticado. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch('http://localhost:8000/api/users/profiles/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  },

  async updateUser(username, userData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8000/api/users/profiles/${username}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    
    return await response.json();
  },

  async deleteUser(username, reason = '') {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8000/api/users/profiles/${username}/admin-delete/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirmation: true,
        reason: reason
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    
    return await response.json();
  }
};