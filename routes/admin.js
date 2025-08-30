const express = require('express');
const { generateCSRFToken, validateAdmin } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const router = express.Router();

// Generate CSRF token for all routes
router.use(generateCSRFToken);

// Admin middleware - require admin access for all routes
router.use(validateAdmin);

// Admin dashboard data
router.get('/dashboard', asyncHandler(async (req, res) => {
  const dashboardData = {
    users: {
      total: 156,
      active: 89,
      inactive: 67,
      newThisMonth: 12
    },
    events: {
      total: 24,
      upcoming: 4,
      completed: 20,
      participants: 234
    },
    security: {
      score: 95,
      incidents: 1,
      threats: 0,
      vulnerabilities: 2
    },
    system: {
      uptime: '99.9%',
      lastBackup: '2024-01-15T02:00:00Z',
      storage: '75%',
      performance: 'excellent'
    },
    lastUpdated: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: dashboardData,
    timestamp: new Date().toISOString()
  });
}));

// User management
router.get('/users', asyncHandler(async (req, res) => {
  const users = [
    {
      id: 1,
      username: 'admin_user',
      email: 'admin@cybr.club',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T14:30:00Z',
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 2,
      username: 'demo_user',
      email: 'demo@cybr.club',
      role: 'member',
      status: 'active',
      lastLogin: '2024-01-15T10:15:00Z',
      createdAt: '2023-06-15T00:00:00Z'
    }
  ];
  
  res.json({
    success: true,
    data: users,
    total: users.length,
    timestamp: new Date().toISOString()
  });
}));

// System logs
router.get('/logs', asyncHandler(async (req, res) => {
  const logs = [
    {
      id: 1,
      level: 'info',
      message: 'User login successful',
      userId: 2,
      ip: '192.168.1.100',
      timestamp: '2024-01-15T14:30:00Z'
    },
    {
      id: 2,
      level: 'warn',
      message: 'Multiple failed login attempts',
      userId: null,
      ip: '203.0.113.45',
      timestamp: '2024-01-15T14:25:00Z'
    },
    {
      id: 3,
      level: 'info',
      message: 'Security scan completed',
      userId: null,
      ip: null,
      timestamp: '2024-01-15T14:00:00Z'
    }
  ];
  
  res.json({
    success: true,
    data: logs,
    total: logs.length,
    timestamp: new Date().toISOString()
  });
}));

// System settings
router.get('/settings', asyncHandler(async (req, res) => {
  const settings = {
    security: {
      mfaRequired: true,
      passwordMinLength: 12,
      sessionTimeout: 24,
      maxLoginAttempts: 5
    },
    notifications: {
      emailAlerts: true,
      slackIntegration: false,
      smsAlerts: false
    },
    maintenance: {
      maintenanceMode: false,
      scheduledMaintenance: '2024-02-01T02:00:00Z',
      backupSchedule: 'daily'
    },
    lastUpdated: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: settings,
    timestamp: new Date().toISOString()
  });
}));

// Update system settings
router.put('/settings', asyncHandler(async (req, res) => {
  try {
    const { settings } = req.body;
    
    // In production, validate and save settings to database
    console.log('Updating system settings:', settings);
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating settings.',
      timestamp: new Date().toISOString()
    });
  }
}));

// System health check
router.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    services: {
      database: 'connected',
      redis: 'connected',
      email: 'connected',
      fileStorage: 'connected'
    },
    resources: {
      cpu: '25%',
      memory: '45%',
      disk: '30%',
      network: 'stable'
    },
    lastCheck: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: health,
    timestamp: new Date().toISOString()
  });
}));

// Backup management
router.post('/backup', asyncHandler(async (req, res) => {
  try {
    // Simulate backup process
    const backup = {
      id: `backup_${Date.now()}`,
      status: 'completed',
      size: '2.5GB',
      createdAt: new Date().toISOString(),
      type: 'full',
      location: '/backups/'
    };
    
    res.status(200).json({
      success: true,
      message: 'Backup completed successfully',
      data: backup,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during backup.',
      timestamp: new Date().toISOString()
    });
  }
}));

// Get backup history
router.get('/backups', asyncHandler(async (req, res) => {
  const backups = [
    {
      id: 'backup_1705312800000',
      status: 'completed',
      size: '2.5GB',
      createdAt: '2024-01-15T02:00:00Z',
      type: 'full',
      location: '/backups/'
    },
    {
      id: 'backup_1705226400000',
      status: 'completed',
      size: '2.4GB',
      createdAt: '2024-01-14T02:00:00Z',
      type: 'full',
      location: '/backups/'
    }
  ];
  
  res.json({
    success: true,
    data: backups,
    total: backups.length,
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;
