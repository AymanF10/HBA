#!/bin/bash

# Clean up any existing installations
echo "Cleaning up existing installations..."
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps to avoid TypeScript version conflicts
echo "Installing dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps

# Explicitly install react-app-rewired and vm-browserify
echo "Installing additional required packages..."
npm install react-app-rewired vm-browserify --save-dev --legacy-peer-deps

# Create a .env file with the program ID
echo "Creating .env file..."
echo "REACT_APP_PROGRAM_ID=7DonoNgUsMjGj89yCDSZhaN2Cxy3YhfCYx6HoSWqzXyz" > .env

echo "Setup complete! Run 'npm start' to start the development server."
