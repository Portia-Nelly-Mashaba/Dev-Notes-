import { useState, useEffect } from 'react';
import { ErrorLog } from '@/types';

const STORAGE_KEY = 'devnotes-pad-errors';

export const useErrorLogs = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedLogs = JSON.parse(stored).map((log: any) => ({
          ...log,
          createdAt: new Date(log.createdAt),
        }));
        setErrorLogs(parsedLogs);
      } else {
        // Add dummy error logs if none exist
        const dummyErrorLogs: ErrorLog[] = [
          {
            id: '1',
            title: 'CORS Error in Production API',
            errorMessage: `Access to fetch at 'https://api.example.com/users' from origin 'https://app.example.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
            fix: `Added CORS middleware to Express server:

app.use(cors({
  origin: ['https://app.example.com', 'https://admin.example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

Also updated Nginx config to handle preflight requests.`,
            stackTrace: `TypeError: Failed to fetch
    at fetchUsers (api.js:15:12)
    at UserList.jsx:23:8
    at commitHookEffectListMount (react-dom.js:8567:23)`,
            tags: ['cors', 'api', 'production', 'express'],
            createdAt: new Date('2024-01-14'),
            context: {
              file: 'src/api/users.js',
              project: 'ecommerce-frontend',
            }
          },
          {
            id: '2',
            title: 'Memory Leak in Node.js Service',
            errorMessage: `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`,
            fix: `Identified event listener leak in WebSocket connections. Fixed by:

1. Properly removing event listeners on disconnect
2. Implementing connection pooling with max limits
3. Added memory monitoring with process.memoryUsage()
4. Set up garbage collection logging

// Fix applied
ws.on('close', () => {
  ws.removeAllListeners();
  connections.delete(ws.id);
});`,
            stackTrace: `<--- Last few GCs --->
[12345:0x103801000]    45123 ms: Mark-Sweep 512.3 (524.8) -> 510.2 (523.8) MB, 1023.4 / 0.0 ms
[12345:0x103801000]    46234 ms: Mark-Sweep 512.8 (524.8) -> 511.1 (523.8) MB, 1234.2 / 0.0 ms`,
            tags: ['memory-leak', 'nodejs', 'websocket', 'performance'],
            createdAt: new Date('2024-01-12'),
            context: {
              file: 'src/services/websocket.js',
              project: 'realtime-chat',
            }
          },
          {
            id: '3',
            title: 'Docker Build Failing on ARM64',
            errorMessage: `ERROR: failed to solve: process "/bin/sh -c npm install" did not complete successfully: exit code: 1
npm ERR! code ENOENT
npm ERR! syscall spawn git`,
            fix: `Issue was with native dependencies not compatible with ARM64 architecture.

Solution:
1. Updated Dockerfile to use multi-platform base image
2. Added platform-specific dependency installation
3. Used docker buildx for cross-platform builds

# Updated Dockerfile
FROM --platform=$BUILDPLATFORM node:18-alpine
RUN apk add --no-cache git python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev`,
            tags: ['docker', 'arm64', 'build', 'platform'],
            createdAt: new Date('2024-01-10'),
            context: {
              file: 'Dockerfile',
              project: 'microservice-api',
            }
          },
          {
            id: '4',
            title: 'React Hydration Mismatch',
            errorMessage: `Warning: Text content did not match. Server: "Loading..." Client: "Welcome back, John!"
Error: Hydration failed because the initial UI does not match what was rendered on the server.`,
            fix: `Hydration mismatch due to client-only user data being rendered on server.

Fixed with useEffect pattern:
const [isClient, setIsClient] = useState(false);
const [user, setUser] = useState(null);

useEffect(() => {
  setIsClient(true);
  setUser(getCurrentUser());
}, []);

return (
  <div>
    {isClient && user ? \`Welcome back, \${user.name}!\` : 'Loading...'}
  </div>
);`,
            tags: ['react', 'hydration', 'ssr', 'nextjs'],
            createdAt: new Date('2024-01-08'),
            context: {
              file: 'src/components/Header.jsx',
              project: 'company-website',
            }
          }
        ];
        setErrorLogs(dummyErrorLogs);
      }
    } catch (error) {
      console.error('Failed to load error logs:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(errorLogs));
    } catch (error) {
      console.error('Failed to save error logs:', error);
    }
  }, [errorLogs]);

  const addErrorLog = (logData: Omit<ErrorLog, 'id' | 'createdAt'>) => {
    const newLog: ErrorLog = {
      ...logData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setErrorLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  const updateErrorLog = (id: string, updates: Partial<ErrorLog>) => {
    setErrorLogs(prev => prev.map(log => 
      log.id === id ? { ...log, ...updates } : log
    ));
  };

  const deleteErrorLog = (id: string) => {
    setErrorLogs(prev => prev.filter(log => log.id !== id));
  };

  return {
    errorLogs,
    addErrorLog,
    updateErrorLog,
    deleteErrorLog,
  };
};