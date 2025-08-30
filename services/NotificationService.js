class NotificationService {
  constructor(io) {
    this.io = io;
    this.notifications = new Map();
    this.subscribers = new Map();
  }

  // Send notification to specific user
  sendToUser(userId, notification) {
    const userSocket = this.getUserSocket(userId);
    if (userSocket) {
      userSocket.emit('notification', {
        id: this.generateId(),
        ...notification,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Send notification to all users in a room
  sendToRoom(room, notification) {
    this.io.to(room).emit('notification', {
      id: this.generateId(),
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to all connected users
  broadcast(notification) {
    this.io.emit('notification', {
      id: this.generateId(),
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Send security alert
  sendSecurityAlert(alert) {
    const notification = {
      type: 'security_alert',
      title: 'Security Alert',
      message: alert.message,
      severity: alert.severity || 'medium',
      details: alert.details,
      requiresAction: true
    };

    // Send to admin room
    this.sendToRoom('admin-room', notification);
    
    // Also broadcast to all users if critical
    if (alert.severity === 'critical') {
      this.broadcast({
        ...notification,
        title: 'Critical Security Alert',
        message: 'A critical security issue has been detected. Please contact administrators immediately.'
      });
    }
  }

  // Send CTF notification
  sendCTFNotification(type, data) {
    const notifications = {
      flag_captured: {
        type: 'ctf_flag_captured',
        title: 'Flag Captured!',
        message: `User ${data.userId} captured flag for challenge ${data.challengeId}`,
        severity: 'info'
      },
      new_challenge: {
        type: 'ctf_new_challenge',
        title: 'New Challenge Available',
        message: 'A new CTF challenge has been added',
        severity: 'info'
      },
      leaderboard_update: {
        type: 'ctf_leaderboard_update',
        title: 'Leaderboard Updated',
        message: 'The CTF leaderboard has been updated',
        severity: 'info'
      }
    };

    const notification = notifications[type];
    if (notification) {
      this.sendToRoom('ctf-room', notification);
    }
  }

  // Send event notification
  sendEventNotification(event) {
    const notification = {
      type: 'event_notification',
      title: 'Event Update',
      message: `Event "${event.title}" has been updated`,
      severity: 'info',
      eventId: event.id
    };

    this.sendToRoom('events-room', notification);
  }

  // Send system notification
  sendSystemNotification(message, severity = 'info') {
    const notification = {
      type: 'system_notification',
      title: 'System Notification',
      message,
      severity,
      timestamp: new Date().toISOString()
    };

    this.broadcast(notification);
  }

  // Subscribe user to notifications
  subscribeUser(userId, socketId, preferences = {}) {
    this.subscribers.set(userId, {
      socketId,
      preferences,
      subscribedAt: new Date().toISOString()
    });
  }

  // Unsubscribe user from notifications
  unsubscribeUser(userId) {
    this.subscribers.delete(userId);
  }

  // Get user socket
  getUserSocket(userId) {
    const subscriber = this.subscribers.get(userId);
    if (subscriber) {
      return this.io.sockets.sockets.get(subscriber.socketId);
    }
    return null;
  }

  // Generate unique ID
  generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get notification statistics
  getStats() {
    return {
      totalSubscribers: this.subscribers.size,
      activeNotifications: this.notifications.size,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = NotificationService;
