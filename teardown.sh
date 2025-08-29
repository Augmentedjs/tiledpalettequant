#!/bin/bash

# Stop and remove containers related to your project
echo "Stopping and removing care-time-tracking-app containers..."
docker compose -p care-time-tracking-app down --volumes

# Remove images associated with the project
echo "Removing care-time-tracking-app images..."
docker rmi $(docker images "care-time-tracking-app*" -q) --force

# Remove orphaned volumes (optional cleanup)
echo "Removing orphaned volumes..."
docker volume prune --force

echo "Teardown for care-time-tracking-app complete!"
