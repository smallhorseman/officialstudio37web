// SECURE AUTHENTICATION SYSTEM
import { supabase } from '../supabaseClient';
import CryptoJS from 'crypto-js';

export class AuthManager {
  static async hashPassword(password) {
    return CryptoJS.SHA256(password + process.env.REACT_APP_SALT).toString();
  }

  static async login(username, password) {
    try {
      // Remove hardcoded credentials
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, password_hash, role')
        .eq('username', username)
        .single();

      if (error || !data) {
        throw new Error('Invalid credentials');
      }

      const hashedInput = await this.hashPassword(password);
      if (hashedInput !== data.password_hash) {
        throw new Error('Invalid credentials');
      }

      // Generate session token
      const token = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await supabase.from('admin_sessions').insert({
        user_id: data.id,
        token,
        expires_at: expiresAt
      });

      localStorage.setItem('admin_token', token);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static generateSessionToken() {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  static async validateSession() {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;

    const { data } = await supabase
      .from('admin_sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (!data || new Date(data.expires_at) < new Date()) {
      this.logout();
      return false;
    }

    return true;
  }

  static logout() {
    localStorage.removeItem('admin_token');
    // Invalidate server session
    const token = localStorage.getItem('admin_token');
    if (token) {
      supabase.from('admin_sessions').delete().eq('token', token);
    }
  }
}
