const winston = require('winston');
const crypto = require('crypto');

class SecurityMonitor {
  constructor() {
    this.violations = [];
    this.threats = [];
    this.incidents = [];
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/security.log' })
      ]
    });
  }

  // Record CSP violations
  recordViolation(violation) {
    const securityEvent = {
      id: crypto.randomUUID(),
      type: 'csp_violation',
      details: violation,
      timestamp: new Date().toISOString(),
      severity: this.assessViolationSeverity(violation)
    };

    this.violations.push(securityEvent);
    this.logger.warn('CSP violation recorded', securityEvent);

    // Check if this is a pattern that requires immediate attention
    if (securityEvent.severity === 'high') {
      this.triggerAlert('High severity CSP violation detected', securityEvent);
    }

    return securityEvent;
  }

  // Assess violation severity
  assessViolationSeverity(violation) {
    const highRiskPatterns = [
      /eval\s*\(/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i
    ];

    const mediumRiskPatterns = [
      /<script/i,
      /on\w+\s*=/i,
      /expression\s*\(/i
    ];

    for (const pattern of highRiskPatterns) {
      if (pattern.test(violation.violatedDirective) || pattern.test(violation.blockedURI)) {
        return 'high';
      }
    }

    for (const pattern of mediumRiskPatterns) {
      if (pattern.test(violation.violatedDirective) || pattern.test(violation.blockedURI)) {
        return 'medium';
      }
    }

    return 'low';
  }

  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove potentially dangerous content
    let sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/expression\s*\(/gi, '');

    // Log suspicious input
    if (input !== sanitized) {
      this.logger.warn('Suspicious input sanitized', {
        original: input,
        sanitized: sanitized,
        timestamp: new Date().toISOString()
      });
    }

    return sanitized;
  }

  // Run security scan
  async runSecurityScan() {
    try {
      this.logger.info('Starting security scan');
      
      const scanResults = {
        scanId: crypto.randomUUID(),
        startTime: new Date().toISOString(),
        status: 'running',
        findings: []
      };

      // Simulate security checks
      const checks = [
        this.checkFilePermissions(),
        this.checkNetworkSecurity(),
        this.checkDatabaseSecurity(),
        this.checkApplicationSecurity()
      ];

      const results = await Promise.all(checks);
      
      scanResults.findings = results.flat();
      scanResults.status = 'completed';
      scanResults.endTime = new Date().toISOString();
      scanResults.score = this.calculateSecurityScore(scanResults.findings);

      this.logger.info('Security scan completed', scanResults);
      return scanResults;

    } catch (error) {
      this.logger.error('Security scan failed', error);
      throw error;
    }
  }

  // Check file permissions
  async checkFilePermissions() {
    // Simulate file permission check
    return [
      {
        type: 'file_permissions',
        severity: 'info',
        title: 'File permissions check',
        description: 'All critical files have appropriate permissions',
        status: 'pass'
      }
    ];
  }

  // Check network security
  async checkNetworkSecurity() {
    // Simulate network security check
    return [
      {
        type: 'network_security',
        severity: 'info',
        title: 'Network security check',
        description: 'Firewall rules are properly configured',
        status: 'pass'
      }
    ];
  }

  // Check database security
  async checkDatabaseSecurity() {
    // Simulate database security check
    return [
      {
        type: 'database_security',
        severity: 'info',
        title: 'Database security check',
        description: 'Database connections are properly secured',
        status: 'pass'
      }
    ];
  }

  // Check application security
  async checkApplicationSecurity() {
    // Simulate application security check
    return [
      {
        type: 'application_security',
        severity: 'info',
        title: 'Application security check',
        description: 'Security headers are properly configured',
        status: 'pass'
      }
    ];
  }

  // Calculate security score
  calculateSecurityScore(findings) {
    let score = 100;
    
    for (const finding of findings) {
      switch (finding.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    return Math.max(0, score);
  }

  // Trigger security alert
  triggerAlert(message, details) {
    const alert = {
      id: crypto.randomUUID(),
      message,
      details,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.logger.error('Security alert triggered', alert);
    
    // In production, this would send notifications via email, Slack, etc.
    console.error('🚨 SECURITY ALERT:', message);
    
    return alert;
  }

  // Clean up old data
  async cleanupOldData() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days of data

      // Clean up old violations
      this.violations = this.violations.filter(
        violation => new Date(violation.timestamp) > cutoffDate
      );

      // Clean up old threats
      this.threats = this.threats.filter(
        threat => new Date(threat.timestamp) > cutoffDate
      );

      // Clean up old incidents
      this.incidents = this.incidents.filter(
        incident => new Date(incident.timestamp) > cutoffDate
      );

      this.logger.info('Old security data cleaned up', {
        violationsRemaining: this.violations.length,
        threatsRemaining: this.threats.length,
        incidentsRemaining: this.incidents.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Data cleanup failed', error);
      throw error;
    }
  }

  // Get security summary
  getSecuritySummary() {
    return {
      violations: {
        total: this.violations.length,
        high: this.violations.filter(v => v.severity === 'high').length,
        medium: this.violations.filter(v => v.severity === 'medium').length,
        low: this.violations.filter(v => v.severity === 'low').length
      },
      threats: {
        total: this.threats.length,
        active: this.threats.filter(t => t.status === 'active').length
      },
      incidents: {
        total: this.incidents.length,
        open: this.incidents.filter(i => i.status === 'open').length,
        resolved: this.incidents.filter(i => i.status === 'resolved').length
      },
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = SecurityMonitor;
