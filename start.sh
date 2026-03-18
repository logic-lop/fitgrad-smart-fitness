#!/bin/bash

# FitGrad Smart Fitness - Full Stack Startup Script
# This script sets up and starts the entire application

echo "🎯 FitGrad Smart Fitness - Full Stack Setup"
echo "==========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if packages/api/node_modules exists
if [ ! -d "packages/api/node_modules" ]; then
    echo "📦 Installing API dependencies..."
    npm --prefix packages/api install
    echo "✅ API dependencies installed"
    echo ""
fi

# Check if database exists
if [ ! -f "packages/api/dev.db" ]; then
    echo "🗄️  Creating SQLite database..."
    cd packages/api
    DATABASE_URL="file:./dev.db" npx prisma migrate dev --name init
    cd ../..
    echo "✅ Database created"
    echo ""
fi

echo "🚀 Starting FitGrad Smart Fitness..."
echo ""
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
