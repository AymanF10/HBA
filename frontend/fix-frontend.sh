#!/bin/bash

echo "Starting frontend troubleshooting script..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules directory not found. Installing dependencies..."
  # Clean up any existing installations
  rm -rf node_modules package-lock.json
  
  # Install dependencies with legacy peer deps
  npm install --legacy-peer-deps
else
  echo "✅ node_modules directory exists."
fi

# Check for react-app-rewired
if [ ! -f "node_modules/.bin/react-app-rewired" ]; then
  echo "❌ react-app-rewired not found. Installing..."
  npm install react-app-rewired --save-dev --legacy-peer-deps
else
  echo "✅ react-app-rewired exists."
fi

# Check for vm-browserify
if ! npm list vm-browserify > /dev/null 2>&1; then
  echo "❌ vm-browserify not found. Installing..."
  npm install vm-browserify --save-dev --legacy-peer-deps
else
  echo "✅ vm-browserify exists."
fi

# Check for config-overrides.js
if [ ! -f "config-overrides.js" ]; then
  echo "❌ config-overrides.js not found. Creating..."
  cat > config-overrides.js << 'EOL'
const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  // Add fallbacks for Node.js core modules
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify"),
    "url": require.resolve("url"),
    "zlib": require.resolve("browserify-zlib"),
    "path": require.resolve("path-browserify"),
    "vm": require.resolve("vm-browserify"),
    "fs": false,
    "process": require.resolve("process/browser.js")
  });
  config.resolve.fallback = fallback;
  
  // Add aliases for process and buffer
  config.resolve.alias = {
    ...config.resolve.alias,
    "process": "process/browser.js",
    "buffer": "buffer"
  };
  
  // Provide process and Buffer globally
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"]
    })
  ]);
  
  // Ignore source map warnings
  config.ignoreWarnings = [/Failed to parse source map/];
  
  return config;
};
EOL
  echo "✅ Created config-overrides.js"
else
  echo "✅ config-overrides.js exists."
fi

# Check for .env file
if [ ! -f ".env" ]; then
  echo "❌ .env file not found. Creating..."
  echo "REACT_APP_PROGRAM_ID=7DonoNgUsMjGj89yCDSZhaN2Cxy3YhfCYx6HoSWqzXyz" > .env
  echo "✅ Created .env file."
else
  echo "✅ .env file exists."
fi

# Check package.json scripts
if ! grep -q "react-app-rewired start" package.json; then
  echo "❌ package.json scripts not configured correctly. Updating..."
  # This is a simple sed replacement - for complex JSON modifications, consider using jq
  sed -i 's/"start": "react-scripts start"/"start": "react-app-rewired start"/g' package.json
  sed -i 's/"build": "react-scripts build"/"build": "react-app-rewired build"/g' package.json
  sed -i 's/"test": "react-scripts test"/"test": "react-app-rewired test"/g' package.json
  echo "✅ Updated package.json scripts."
else
  echo "✅ package.json scripts configured correctly."
fi

# Install any missing polyfill packages
echo "Installing any missing polyfill packages..."
npm install --save buffer process crypto-browserify stream-browserify assert stream-http https-browserify os-browserify url browserify-zlib path-browserify --legacy-peer-deps

echo "✅ Troubleshooting complete! Try running 'npm start' now."
