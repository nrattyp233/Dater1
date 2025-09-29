#!/bin/bash

echo "🚀 SEEDING PRODUCTION DATABASE VIA API..."

# Create users one by one
echo "Creating users..."
curl -X POST https://create-a-date.netlify.app/.netlify/functions/data-api \
  -H "Content-Type: application/json" \
  -d '{"action": "updateUser", "payload": {"id": 1, "name": "Alex Jordan", "age": 28, "bio": "Software engineer who loves building amazing apps. Always up for a coffee chat about tech or life!", "photos": ["https://picsum.photos/seed/alex1/400/600","https://picsum.photos/seed/alex2/400/600"], "interests": ["Technology","Coffee","Fitness","Travel"], "gender": "male", "isPremium": false, "preferences": {"interestedIn": ["female"], "ageRange": {"min": 24, "max": 35}}, "earnedBadgeIds": []}}'

curl -X POST https://create-a-date.netlify.app/.netlify/functions/data-api \
  -H "Content-Type: application/json" \
  -d '{"action": "updateUser", "payload": {"id": 2, "name": "Maya Chen", "age": 26, "bio": "UX designer passionate about creating beautiful experiences. Dog mom to a golden retriever named Pixel!", "photos": ["https://picsum.photos/seed/maya1/400/600","https://picsum.photos/seed/maya2/400/600"], "interests": ["Design","Dogs","Art","Hiking"], "gender": "female", "isPremium": false, "preferences": {"interestedIn": ["male"], "ageRange": {"min": 25, "max": 32}}, "earnedBadgeIds": []}}'

curl -X POST https://create-a-date.netlify.app/.netlify/functions/data-api \
  -H "Content-Type: application/json" \
  -d '{"action": "updateUser", "payload": {"id": 3, "name": "Jordan Rivera", "age": 30, "bio": "Entrepreneur building the next big thing. Love adventure sports and trying new cuisines!", "photos": ["https://picsum.photos/seed/jordan1/400/600","https://picsum.photos/seed/jordan2/400/600"], "interests": ["Business","Adventure","Food","Networking"], "gender": "male", "isPremium": false, "preferences": {"interestedIn": ["female"], "ageRange": {"min": 26, "max": 34}}, "earnedBadgeIds": []}}'

curl -X POST https://create-a-date.netlify.app/.netlify/functions/data-api \
  -H "Content-Type: application/json" \
  -d '{"action": "updateUser", "payload": {"id": 4, "name": "Sophia Kim", "age": 27, "bio": "Marketing manager by day, yoga instructor by evening. Always looking for the next great date idea!", "photos": ["https://picsum.photos/seed/sophia1/400/600","https://picsum.photos/seed/sophia2/400/600"], "interests": ["Marketing","Yoga","Wellness","Music"], "gender": "female", "isPremium": false, "preferences": {"interestedIn": ["male"], "ageRange": {"min": 27, "max": 35}}, "earnedBadgeIds": []}}'

curl -X POST https://create-a-date.netlify.app/.netlify/functions/data-api \
  -H "Content-Type: application/json" \
  -d '{"action": "updateUser", "payload": {"id": 5, "name": "Marcus Thompson", "age": 29, "bio": "Personal trainer who believes in living life to the fullest. Lets explore the city together!", "photos": ["https://picsum.photos/seed/marcus1/400/600","https://picsum.photos/seed/marcus2/400/600"], "interests": ["Fitness","Sports","Outdoors","Photography"], "gender": "male", "isPremium": false, "preferences": {"interestedIn": ["female"], "ageRange": {"min": 24, "max": 32}}, "earnedBadgeIds": []}}'

echo "Creating date posts..."
curl -X POST https://create-a-date.netlify.app/.netlify/functions/data-api \
  -H "Content-Type: application/json" \
  -d '{"action": "createDate", "payload": {"title": "Coffee & Code Chat", "description": "Lets grab coffee and talk about our favorite projects! Perfect for fellow tech enthusiasts.", "createdBy": 1, "location": "Downtown Tech Cafe", "dateTime": "2024-12-30T15:00:00Z", "categories": ["Food & Drink"]}}'

curl -X POST https://create-a-date.netlify.app/.netlify/functions/data-api \
  -H "Content-Type: application/json" \
  -d '{"action": "createDate", "payload": {"title": "Sunset Yoga Session", "description": "Join me for a relaxing yoga session at the park as the sun sets. All levels welcome!", "createdBy": 4, "location": "Central Park Pavilion", "dateTime": "2024-12-28T17:30:00Z", "categories": ["Active & Fitness", "Relaxing & Casual"]}}'

curl -X POST https://create-a-date.netlify.app/.netlify/functions/data-api \
  -H "Content-Type: application/json" \
  -d '{"action": "createDate", "payload": {"title": "Food Truck Adventure", "description": "Lets explore the citys best food trucks and try something new! Perfect for foodies.", "createdBy": 3, "location": "Food Truck Plaza", "dateTime": "2024-12-29T12:00:00Z", "categories": ["Food & Drink", "Adventure"]}}'

echo "✅ SEEDING COMPLETE!"
