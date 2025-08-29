# Tile Palette Qaunt

## Scripts

### Dev (bind-mount), port 8080
start.sh

### Dev on port 5173 with logs
start.sh --port 5173 --logs

### Prod (build image), then view logs
start.sh --prod --rebuild --logs

### Stop and remove containers
teardown.sh

### Stop + remove volumes + local images; prune danglers
teardown.sh --volumes --images --prune

