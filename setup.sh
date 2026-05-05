#!/bin/bash

# Zedu API Automation - One Command Setup
# Usage: ./setup.sh <email> <password>
# Example: ./setup.sh testuser@example.com MyPassword123

echo "Automatic Zedu API Automation Setup"
echo "============================"

# Check if email and password were provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo ""
  echo "Usage: ./setup.sh <email> <password>"
  echo "Example: ./setup.sh testuser@example.com MyPassword123"
  echo ""
  echo "Don't have an account? Register first:"
  echo 'curl -s -X POST "https://api.staging.zedu.chat/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"youremail@example.com","password":"YourfavPassword123","first_name":"Your","last_name":"Name","username":"yourusername"}'
```
  exit 1
fi

EMAIL=$1
PASSWORD=$2
BASE_URL="https://api.staging.zedu.chat/api/v1"


echo ""
echo "Installing dependencies"
npm install


echo ""
echo "Creating .env file"
cat > .env << EOF
BASE_URL=$BASE_URL
TEST_EMAIL=$EMAIL
TEST_PASSWORD=$PASSWORD
EOF
echo "   .env file has been created with your credentials"

# Checking it the test image is present
if [ ! -f "utils/test-image.png" ]; then
  echo ""
  echo "🖼️  Creating a test image..."
  # If no, it creates a valid PNG file for avatar upload tests using hex code
  printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > utils/test-image.png
  echo "   test-image.png created"
else
  echo ""
  echo "test-image.png is created"
fi


echo ""
echo "Running tests..."
echo ""
npm test

echo ""
echo "============================"
echo "✅ Setup complete!"