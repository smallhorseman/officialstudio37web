// Simple authentication without external dependencies
import { supabase } from '../supabaseClient';

export class AuthManager {
  static async hashPassword(password) {
    // Use Web Crypto API instead of CryptoJS
    const encoder = new TextEncoder();
    const data = encoder.encode(password + (import.meta.env.VITE_PASSWORD_SALT || ''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async login(username, password) {
    // For now, use simple auth from simpleAuth.js
    const { simpleAuth } = await import('./simpleAuth');
    return simpleAuth.login(username, password);
  }

  static logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('studio37_admin');
    localStorage.removeItem('studio37_admin_token');
  }

  static async validateSession() {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('studio37_admin_token');
    return !!token;
  }
}
