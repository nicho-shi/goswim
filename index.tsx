import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error('❌ Clerk Publishable Key 未配置！');
  console.error('请在 .env.local 文件中设置: VITE_CLERK_PUBLISHABLE_KEY=你的_clerk_publishable_key');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {clerkPubKey ? (
      <ClerkProvider publishableKey={clerkPubKey}>
        <App />
      </ClerkProvider>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">配置错误</h1>
          <p className="text-slate-600 mb-4">Clerk Publishable Key 未配置</p>
          <p className="text-sm text-slate-500">
            请在 .env.local 文件中设置:<br />
            <code className="bg-slate-100 px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY=你的密钥</code>
          </p>
        </div>
      </div>
    )}
  </React.StrictMode>
);
