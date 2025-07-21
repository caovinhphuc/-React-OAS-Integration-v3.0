const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role || 'user';
    this.permissions = data.permissions || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastLogin = data.lastLogin;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Mock database - in real app this would be MongoDB/PostgreSQL
  static users = [
    {
      id: 1,
      email: 'admin@demo.com',
      name: 'Admin User',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_users'],
      passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: demo123
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: 2,
      email: 'user@demo.com',
      name: 'Regular User',
      role: 'user',
      permissions: ['read', 'write'],
      passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: demo123
      isActive: true,
      createdAt: new Date('2024-01-02'),
      lastLogin: new Date()
    }
  ];

  static async findByEmail(email) {
    const userData = this.users.find(u => u.email === email && u.isActive);
    return userData ? new User(userData) : null;
  }

  static async findById(id) {
    const userData = this.users.find(u => u.id === parseInt(id) && u.isActive);
    return userData ? new User(userData) : null;
  }

  static async create(userData) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      createdAt: new Date(),
      isActive: true
    };
    
    if (userData.password) {
      newUser.passwordHash = await bcrypt.hash(userData.password, 10);
      delete newUser.password;
    }
    
    this.users.push(newUser);
    return new User(newUser);
  }

  async validatePassword(password) {
    const userData = User.users.find(u => u.id === this.id);
    return userData ? await bcrypt.compare(password, userData.passwordHash) : false;
  }

  generateAuthToken() {
    return jwt.sign(
      { 
        id: this.id, 
        email: this.email, 
        role: this.role,
        permissions: this.permissions
      },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '24h' }
    );
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      permissions: this.permissions,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      isActive: this.isActive
    };
  }

  hasPermission(permission) {
    return this.permissions.includes(permission) || this.role === 'admin';
  }

  async updateLastLogin() {
    const userIndex = User.users.findIndex(u => u.id === this.id);
    if (userIndex !== -1) {
      User.users[userIndex].lastLogin = new Date();
      this.lastLogin = User.users[userIndex].lastLogin;
    }
  }
}

module.exports = User;
