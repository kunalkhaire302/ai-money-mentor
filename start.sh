#!/bin/bash
echo "========================================================"
echo "        Starting AI Money Mentor Platform"
echo "========================================================"

# Trap SIGINT to kill background processes on Ctrl+C
trap 'kill 0' SIGINT

echo "[1/2] Launching FastAPI Backend on Port 8000..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

echo "[2/2] Launching Next.js Frontend on Port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================================"
echo "All services are booting up in the background!"
echo ""
echo "- Frontend App: http://localhost:3000"
echo "- Backend API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers gracefully."
echo "========================================================"

wait
