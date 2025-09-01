#!/bin/bash

# Stop and remove containers related to the project
echo "Stopping and removing tiledpalettequant containers..."
docker compose -p  down --volumes

# Remove images associated with the project
echo "Removing tiledpalettequant images..."
docker rmi $(docker images "tiledpalettequant*" -q) --force

# Remove orphaned volumes
echo "Removing orphaned volumes..."
docker volume prune --force

echo "Teardown for tiledpalettequant complete!"
