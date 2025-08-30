/**
 * Utilitário de logger simples para a aplicação
 */

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const baseMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
  }
  
  return baseMessage;
};

const logger = {
  info: (message, data = null) => {
    console.log(formatMessage('info', message, data));
  },
  
  error: (message, error = null) => {
    console.error(formatMessage('error', message, error));
  },
  
  warn: (message, data = null) => {
    console.warn(formatMessage('warn', message, data));
  },
  
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatMessage('debug', message, data));
    }
  }
};

module.exports = logger; 