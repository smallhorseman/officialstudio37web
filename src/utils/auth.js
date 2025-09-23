// Simple authentication without external dependencies

export class AuthManager {
  static async hashPassword(password) {
    // Use Web Crypto API instead of CryptoJS
    const encoder = new TextEncoder();
    const data = encoder.encode(password + (import.meta.env.VITE_PASSWORD_SALT || 'studio37_salt_2024'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async login(username, password) {
    // Simple authentication for demo purposes
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'studio37admin';
    
    if (username === adminUsername && password === adminPassword) {
      const token = await this.generateToken();
      localStorage.setItem('studio37_admin_token', token);
      localStorage.setItem('studio37_admin', 'true');
      return { success: true, token };
    }
    
    return { success: false, error: 'Invalid credentials' };
  }

  static async generateToken() {
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2);
    const tokenData = `${timestamp}_${randomStr}`;
    return btoa(tokenData);
  }

  static logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('studio37_admin');
    localStorage.removeItem('studio37_admin_token');
  }

  static async validateSession() {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('studio37_admin_token');
    const adminStatus = localStorage.getItem('studio37_admin');
    return !!(token && adminStatus === 'true');
  }
}
