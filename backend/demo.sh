#!/bin/bash

PORT=3002
BASE_URL="http://localhost:$PORT"

echo "================================================"
echo "  CIA Backend - Log Demo"
echo "================================================"

# Kill anything on the port and clear old logs
fuser -k ${PORT}/tcp 2>/dev/null
sleep 1
> logs/combined.log 2>/dev/null || true
> logs/error.log 2>/dev/null || true

# Start server in background
DB_HOST=localhost PORT=$PORT npm run start &
SERVER_PID=$!

# Wait until server is ready
echo ""
echo "Starting server..."
for i in $(seq 1 20); do
  sleep 2
  if curl -s "$BASE_URL/test/logs" > /dev/null 2>&1; then
    echo "Server ready on port $PORT"
    break
  fi
done

echo ""
echo "================================================"
echo "  TEST 1: LOGIN (POST with body)"
echo "  Endpoint: POST /auth/login"
echo "================================================"
sleep 1
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')
echo "Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "================================================"
echo "  TEST 2: PROTECTED ROUTE with JWT token"
echo "  Endpoint: GET /auth/me"
echo "================================================"
sleep 1
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "================================================"
echo "  TEST 3: CREATE INVENTORY ITEM (POST with body + JWT)"
echo "  Endpoint: POST /inventory"
echo "================================================"
sleep 1
curl -s -X POST "$BASE_URL/inventory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Laptop","quantity":10,"price":999.99}'
echo ""

echo ""
echo "================================================"
echo "  TEST 4: GET INVENTORY LIST (JWT required)"
echo "  Endpoint: GET /inventory"
echo "================================================"
sleep 1
curl -s "$BASE_URL/inventory" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "================================================"
echo "  TEST 5: UNAUTHORIZED REQUEST (no token)"
echo "  Endpoint: GET /inventory"
echo "================================================"
sleep 1
curl -s "$BASE_URL/inventory"
echo ""

echo ""
echo "================================================"
echo "  TEST 6: FORCED ERROR"
echo "  Endpoint: GET /test/error"
echo "================================================"
sleep 1
curl -s "$BASE_URL/test/error"
echo ""

echo ""
echo "================================================"
echo "  LOGS SUMMARY"
echo "================================================"
echo ""
echo "--- logs/combined.log ---"
cat logs/combined.log | grep -v "^$"
echo ""
echo "--- logs/error.log ---"
cat logs/error.log | grep -v "^$"

echo ""
echo "================================================"
echo "  Demo complete. Press Ctrl+C to stop server."
echo "================================================"

wait $SERVER_PID
