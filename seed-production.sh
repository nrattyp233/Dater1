#!/bin/bash

# Set the base URL for the API. Default to local Netlify dev server if not set.
BASE_URL=${APP_URL:-"http://localhost:8888"}
API_ENDPOINT="$BASE_URL/.netlify/functions/data-api"

echo "🚀 SEEDING DATABASE VIA API at $API_ENDPOINT..."

# Create or update users one by one
echo "Creating users..."
curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"action": "createUser", "payload": {"user": {"id": "auth0|662a7e71a3962305dfb24f53", "name": "Alex Jordan", "age": 28, "bio": "Software engineer who loves building amazing apps.", "photos": ["https://picsum.photos/seed/alex1/400/600"], "interests": ["Technology", "Coffee"], "gender": "male"}}}'

curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"action": "createUser", "payload": {"user": {"id": "auth0|662a7e71a3962305dfb24f54", "name": "Maya Chen", "age": 26, "bio": "UX designer passionate about creating beautiful experiences.", "photos": ["https://picsum.photos/seed/maya1/400/600"], "interests": ["Design", "Dogs"], "gender": "female"}}}'

curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"action": "createUser", "payload": {"user": {"id": "auth0|662a7e71a3962305dfb24f55", "name": "Jordan Rivera", "age": 30, "bio": "Entrepreneur building the next big thing.", "photos": ["https://picsum.photos/seed/jordan1/400/600"], "interests": ["Business", "Adventure"], "gender": "male"}}}'

curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"action": "createUser", "payload": {"user": {"id": "auth0|662a7e71a3962305dfb24f56", "name": "Sophia Kim", "age": 27, "bio": "Marketing manager by day, yoga instructor by evening.", "photos": ["https://picsum.photos/seed/sophia1/400/600"], "interests": ["Marketing", "Yoga"], "gender": "female"}}}'

curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"action": "createUser", "payload": {"user": {"id": "auth0|662a7e71a3962305dfb24f57", "name": "Marcus Thompson", "age": 29, "bio": "Personal trainer who believes in living life to the fullest.", "photos": ["https://picsum.photos/seed/marcus1/400/600"], "interests": ["Fitness", "Sports"], "gender": "male"}}}'

# Create date posts
echo "Creating date posts..."
curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"action": "createDatePost", "payload": {"post": {"id": "date_1", "title": "Coffee & Code Chat", "description": "Lets grab coffee and talk about our favorite projects!", "createdBy": "auth0|662a7e71a3962305dfb24f53", "location": "Downtown Tech Cafe", "dateTime": "2024-12-30T15:00:00Z", "categories": ["Food & Drink"]}}}'

curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"action": "createDatePost", "payload": {"post": {"id": "date_2", "title": "Sunset Yoga Session", "description": "Join me for a relaxing yoga session at the park.", "createdBy": "auth0|662a7e71a3962305dfb24f56", "location": "Central Park Pavilion", "dateTime": "2024-12-28T17:30:00Z", "categories": ["Active & Fitness"]}}}'

curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"action": "createDatePost", "payload": {"post": {"id": "date_3", "title": "Food Truck Adventure", "description": "Lets explore the citys best food trucks!", "createdBy": "auth0|662a7e71a3962305dfb24f55", "location": "Food Truck Plaza", "dateTime": "2024-12-29T12:00:00Z", "categories": ["Food & Drink"]}}}'

echo "✅ SEEDING COMPLETE!"
