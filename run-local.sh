#!/bin/bash

# Start MongoDB
echo "Starting MongoDB..."
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Build and start the runner service
echo "Building and starting runner service..."
cd runner
docker build -t replit-clone-base:latest .
cd ..

# Start the frontend
echo "Starting frontend..."
cd frontend
npm install
npm run dev &
cd ..

# Start the runner service
echo "Starting runner service..."
cd runner
npm install
npm run dev &
cd ..

echo "All services are starting up..."
echo "Frontend will be available at: http://localhost:5173"
echo "Runner service will be available at: http://localhost:3000"
echo "MongoDB is running on: mongodb://localhost:27017" 