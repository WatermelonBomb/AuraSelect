#!/bin/bash

# AuraSelect Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="auraselect"
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}🚀 Starting AuraSelect deployment (${ENVIRONMENT})${NC}"

# Check if required files exist
check_requirements() {
    echo -e "${YELLOW}📋 Checking requirements...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    if [[ ! -f ".env.${ENVIRONMENT}" ]]; then
        echo -e "${RED}❌ Environment file .env.${ENVIRONMENT} not found${NC}"
        echo -e "${YELLOW}Please create .env.${ENVIRONMENT} based on .env.example${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements satisfied${NC}"
}

# Load environment variables
load_environment() {
    echo -e "${YELLOW}🔧 Loading environment variables...${NC}"
    export $(cat ".env.${ENVIRONMENT}" | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment loaded${NC}"
}

# Build and deploy services
deploy_services() {
    echo -e "${YELLOW}🏗️  Building and deploying services...${NC}"
    
    # Stop existing services
    docker-compose -f $COMPOSE_FILE down
    
    # Pull latest images
    docker-compose -f $COMPOSE_FILE pull
    
    # Build custom images
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    # Start services
    docker-compose -f $COMPOSE_FILE up -d
    
    echo -e "${GREEN}✅ Services deployed${NC}"
}

# Run database migrations
run_migrations() {
    echo -e "${YELLOW}📊 Running database migrations...${NC}"
    
    # Wait for database to be ready
    echo -e "${BLUE}⏳ Waiting for database...${NC}"
    docker-compose -f $COMPOSE_FILE exec -T backend bash -c "
        while ! pg_isready -h postgres -p 5432 -U auraselect; do
            echo 'Waiting for database...'
            sleep 2
        done
    "
    
    # Run migrations
    docker-compose -f $COMPOSE_FILE exec -T backend alembic upgrade head
    
    echo -e "${GREEN}✅ Migrations completed${NC}"
}

# Health check
health_check() {
    echo -e "${YELLOW}🏥 Performing health checks...${NC}"
    
    # Check frontend
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
        return 1
    fi
    
    # Check backend
    if curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All health checks passed${NC}"
}

# Cleanup old images and containers
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    # Remove dangling images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes (be careful!)
    # docker volume prune -f
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Show deployment status
show_status() {
    echo -e "${BLUE}📊 Deployment Status${NC}"
    echo "===================="
    docker-compose -f $COMPOSE_FILE ps
    echo
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo
    echo -e "${BLUE}Access URLs:${NC}"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8000"
    echo "API Documentation: http://localhost:8000/api/v1/docs"
    echo
    echo -e "${BLUE}Useful commands:${NC}"
    echo "View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "Stop services: docker-compose -f $COMPOSE_FILE down"
    echo "Restart service: docker-compose -f $COMPOSE_FILE restart <service>"
}

# Rollback function
rollback() {
    echo -e "${YELLOW}🔄 Rolling back deployment...${NC}"
    docker-compose -f $COMPOSE_FILE down
    # Restore from backup if needed
    echo -e "${GREEN}✅ Rollback completed${NC}"
}

# Main execution
main() {
    case $1 in
        "rollback")
            rollback
            ;;
        *)
            check_requirements
            load_environment
            deploy_services
            run_migrations
            sleep 10  # Wait for services to start
            health_check
            cleanup
            show_status
            ;;
    esac
}

# Handle script termination
trap 'echo -e "\n${RED}⚠️  Deployment interrupted${NC}"; exit 1' INT TERM

# Run main function
main $1

echo -e "${GREEN}🎊 AuraSelect deployment completed successfully!${NC}"