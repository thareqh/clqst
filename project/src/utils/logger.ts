// Logger levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  showTimestamp: boolean;
}

// Default config
const config: LogConfig = {
  enabled: import.meta.env.MODE === 'development',
  level: 'info',
  showTimestamp: true
};

// Sensitive data patterns to mask
const SENSITIVE_PATTERNS = [
  /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, // Email
  /([A-Za-z0-9]{20,})/g, // Long alphanumeric strings (likely tokens/IDs)
  /(firebase.*\.com)/gi, // Firebase URLs
  /(https:\/\/firebasestorage\.googleapis\.com[^\s"']*)/gi, // Firebase Storage URLs
  /([0-9]{6,})/g // Long number sequences
];

// Mask sensitive data
export const maskSensitiveData = (data: any): any => {
  if (!data) return data;
  
  // Jika data adalah array
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }
  
  // Jika data adalah object
  if (typeof data === 'object') {
    const maskedData = { ...data };
    
    // Daftar field yang perlu disamarkan
    const sensitiveFields = [
      'email',
      'fullName',
      'bio',
      'profileImage',
      'country',
      'languages',
      'collaborationPreferences',
      'projectPreferences',
      'skills'
    ];
    
    for (const key in maskedData) {
      if (sensitiveFields.includes(key)) {
        if (typeof maskedData[key] === 'string') {
          maskedData[key] = '[REDACTED]';
        } else if (Array.isArray(maskedData[key])) {
          maskedData[key] = `[Array(${maskedData[key].length})]`;
        }
      } else if (typeof maskedData[key] === 'object') {
        maskedData[key] = maskSensitiveData(maskedData[key]);
      }
    }
    
    return maskedData;
  }
  
  return data;
};

export const logWithMask = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      const maskedData = maskSensitiveData(data);
      console.log(message, maskedData);
    } else {
      console.log(message);
    }
  }
};

// Logger implementation
export const logger = {
  setConfig: (newConfig: Partial<LogConfig>) => {
    Object.assign(config, newConfig);
  },

  debug: (...args: any[]) => {
    if (!config.enabled || config.level !== 'debug') return;
    const maskedArgs = args.map(arg => maskSensitiveData(arg));
    if (config.showTimestamp) {
      console.debug(new Date().toISOString(), ...maskedArgs);
    } else {
      console.debug(...maskedArgs);
    }
  },

  info: (...args: any[]) => {
    if (!config.enabled || !['debug', 'info'].includes(config.level)) return;
    const maskedArgs = args.map(arg => maskSensitiveData(arg));
    if (config.showTimestamp) {
      console.info(new Date().toISOString(), ...maskedArgs);
    } else {
      console.info(...maskedArgs);
    }
  },

  warn: (...args: any[]) => {
    if (!config.enabled || !['debug', 'info', 'warn'].includes(config.level)) return;
    const maskedArgs = args.map(arg => maskSensitiveData(arg));
    if (config.showTimestamp) {
      console.warn(new Date().toISOString(), ...maskedArgs);
    } else {
      console.warn(...maskedArgs);
    }
  },

  error: (...args: any[]) => {
    if (!config.enabled) return;
    const maskedArgs = args.map(arg => maskSensitiveData(arg));
    if (config.showTimestamp) {
      console.error(new Date().toISOString(), ...maskedArgs);
    } else {
      console.error(...maskedArgs);
    }
  }
}; 