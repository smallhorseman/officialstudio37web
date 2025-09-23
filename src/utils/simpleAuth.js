// Simple authentication for admin panel without database dependency

export const simpleAuth = {
  login(username, password) {
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
      const token = btoa(`${username}:${Date.now()}`);
      localStorage.setItem('studio37_admin_token', token);
      localStorage.setItem('studio37_admin', 'true');
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  },
  
  logout() {
    localStorage.removeItem('studio37_admin_token');
    localStorage.removeItem('studio37_admin');
  },
  
  isAuthenticated() {
    return localStorage.getItem('studio37_admin_token') !== null;
  }
};
