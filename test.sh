#!/bin/bash

# Test script for image-to-text application
# This script creates a simple test image and uploads it to test the OCR functionality

echo "=== Image to Text - Test Script ==="
echo ""

# Check if application is running
echo "1. Checking if the application is running..."
HEALTH_CHECK=$(curl -s http://localhost:3000/health)
if [ $? -eq 0 ]; then
    echo "✓ Application is running"
    echo "  Response: $HEALTH_CHECK"
else
    echo "✗ Application is not running. Please start it with: docker compose up -d"
    exit 1
fi

echo ""
echo "2. API Information:"
curl -s http://localhost:3000/ | json_pp 2>/dev/null || curl -s http://localhost:3000/

echo ""
echo ""
echo "3. Checking current results in database..."
RESULTS=$(curl -s http://localhost:3000/results)
echo "$RESULTS" | json_pp 2>/dev/null || echo "$RESULTS"

echo ""
echo "=== Test Complete ==="
echo ""
echo "To test image upload functionality:"
echo "  1. Create or find an image file with text"
echo "  2. Run: curl -X POST -F \"image=@your-image.jpg\" http://localhost:3000/upload"
echo "  3. Check results: curl http://localhost:3000/results"
echo ""
echo "For more information, see README.md"
