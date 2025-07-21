#!/bin/bash

# React OAS Integration - Production Deployment Script
# Optimized for production deployment with Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${PURPLE}🚀 React OAS Integration - Production Deployment${NC}"
    echo -e "${PURPLE}=================================================${NC}"
}

print_step() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] 🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi

    if [ ! -f "docker-compose.prod.yml" ]; then
        print_error "docker-compose.prod.yml not found. Please ensure production config exists."
        exit 1
    fi
}

# Display help
show_help() {
    print_header
    echo ""
    echo "Usage: ./deploy.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all production services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show service status"
    echo "  logs      Show service logs"
    echo "  test      Run all tests"
    echo "  health    Check service health"
    echo "  build     Build Docker images"
    echo "  clean     Clean Docker system"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh start    # Start production stack"
    echo "  ./deploy.sh logs     # View real-time logs"
    echo "  ./deploy.sh test     # Run complete test suite"
    echo ""
}

# Check Docker Compose availability
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
        return 0
    elif docker compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
        return 0
    else
        return 1
    fi
}

# Start services
start_services() {
    print_header
    print_step "Starting production deployment..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Using fallback deployment..."
        deploy_without_compose
        return
    fi

    # Check Docker Compose
    if ! check_docker_compose; then
        print_warning "Docker Compose not available. Using fallback deployment..."
        deploy_without_compose
        return
    fi

    # Create logs directory
    mkdir -p logs

    # Build and start services
    print_step "Building and starting Docker containers..."
    $DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build

    print_step "Waiting for services to be ready..."
    sleep 10

    # Health check
    health_check

    print_success "Production deployment completed!"
    print_info "🌐 Application URLs:"
    print_info "   Frontend: http://localhost"
    print_info "   Backend:  http://localhost:3001"
    print_info "   AI Service: http://localhost:8001"
    echo ""
    print_info "📋 Next steps:"
    print_info "   ./deploy.sh status  - Check service status"
    print_info "   ./deploy.sh logs    - View logs"
    print_info "   ./deploy.sh test    - Run tests"
}

# Stop services
stop_services() {
    print_header
    print_step "Stopping all services..."

    docker-compose -f docker-compose.prod.yml down

    print_success "All services stopped successfully!"
}

# Restart services
restart_services() {
    print_header
    print_step "Restarting all services..."

    stop_services
    sleep 2
    start_services
}

# Show status
show_status() {
    print_header
    print_step "Checking service status..."

    echo ""
    if check_docker_compose && command -v docker &> /dev/null; then
        print_info "Docker Containers:"
        $DOCKER_COMPOSE -f docker-compose.prod.yml ps

        echo ""
        print_info "Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    else
        print_info "Process Status:"
        echo "Backend (Node.js):"
        pgrep -f "node.*3001" > /dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
        echo "AI Service (Python):"
        pgrep -f "python.*8001" > /dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
        echo "Frontend Server:"
        pgrep -f "python.*http.server" > /dev/null && echo "  ✅ Running" || echo "  ❌ Not running"
    fi

    echo ""
    print_info "Port Status:"
    echo "Port 3001 (Backend): $(lsof -i :3001 > /dev/null 2>&1 && echo "✅ In use" || echo "❌ Free")"
    echo "Port 8001 (AI Service): $(lsof -i :8001 > /dev/null 2>&1 && echo "✅ In use" || echo "❌ Free")"
    echo "Port 80 (Frontend): $(lsof -i :80 > /dev/null 2>&1 && echo "✅ In use" || echo "❌ Free")"

    echo ""
    if command -v docker &> /dev/null && docker system df &> /dev/null; then
        print_info "Docker System Info:"
        docker system df
    else
        print_info "System Resources:"
        echo "Disk Usage: $(df -h . | tail -1 | awk '{print $5 " used of " $2}')"
        echo "Memory Usage: $(free -h 2>/dev/null | grep Mem | awk '{print $3 " used of " $2}' || echo "N/A")"
    fi
}

# Show logs
show_logs() {
    print_header
    print_step "Showing service logs..."

    if [ -n "$2" ]; then
        print_info "Showing logs for service: $2"
        docker-compose -f docker-compose.prod.yml logs -f "$2"
    else
        print_info "Showing logs for all services (Ctrl+C to exit)"
        docker-compose -f docker-compose.prod.yml logs -f
    fi
}

# Run tests
run_tests() {
    print_header
    print_step "Running complete test suite..."

    # Wait for services to be ready
    print_step "Waiting for services to be ready..."
    sleep 5

    local test_results=0

    # Complete system test
    if [ -f "complete_system_test.js" ]; then
        print_step "Running complete system test..."
        if node complete_system_test.js; then
            print_success "Complete system test passed"
        else
            print_error "Complete system test failed"
            test_results=1
        fi
    fi

    # Integration tests
    if [ -f "integration_test.js" ]; then
        print_step "Running integration tests..."
        if node integration_test.js; then
            print_success "Integration tests passed"
        else
            print_error "Integration tests failed"
            test_results=1
        fi
    fi

    # Advanced integration tests
    if [ -f "advanced_integration.js" ]; then
        print_step "Running advanced integration tests..."
        if node advanced_integration.js; then
            print_success "Advanced integration tests passed"
        else
            print_error "Advanced integration tests failed"
            test_results=1
        fi
    fi

    # Frontend connection test
    if [ -f "frontend_connection_test.js" ]; then
        print_step "Running frontend connection tests..."
        if node frontend_connection_test.js; then
            print_success "Frontend connection tests passed"
        else
            print_error "Frontend connection tests failed"
            test_results=1
        fi
    fi

    # End-to-end tests
    if [ -f "end_to_end_test.js" ]; then
        print_step "Running end-to-end tests..."
        if node end_to_end_test.js; then
            print_success "End-to-end tests passed"
        else
            print_error "End-to-end tests failed"
            test_results=1
        fi
    fi

    echo ""
    if [ $test_results -eq 0 ]; then
        print_success "🎉 All tests passed! System is production ready."
    else
        print_error "❌ Some tests failed. Please check the issues above."
        exit 1
    fi
}

# Health check
health_check() {
    print_step "Performing health checks..."

    local health_results=0

    # Backend health check
    print_step "Checking backend health..."
    if curl -f -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed - service may still be starting"
        health_results=1
    fi

    # AI Service health check
    print_step "Checking AI service health..."
    if curl -f -s http://localhost:8001/health > /dev/null 2>&1; then
        print_success "AI service health check passed"
    else
        print_warning "AI service health check failed - service may still be starting"
        health_results=1
    fi

    # Frontend health check
    print_step "Checking frontend health..."
    if curl -f -s http://localhost > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_warning "Frontend health check failed - service may still be starting"
        health_results=1
    fi

    echo ""
    if [ $health_results -eq 0 ]; then
        print_success "🎉 All health checks passed!"
    else
        print_warning "⚠️  Some health checks failed. Services may still be starting."
        print_info "Wait a moment and try: ./deploy.sh health"
    fi
}

# Build images
build_images() {
    print_header
    print_step "Building Docker images..."

    docker-compose -f docker-compose.prod.yml build --no-cache

    print_success "Docker images built successfully!"
}

# Clean Docker system
clean_docker() {
    print_header
    print_step "Cleaning Docker system..."

    # Stop containers
    docker-compose -f docker-compose.prod.yml down --remove-orphans

    # Clean system
    print_step "Removing unused Docker resources..."
    docker system prune -f

    print_success "Docker system cleaned!"
}

# Fallback deployment without Docker Compose
deploy_without_compose() {
    print_warning "Docker Compose not available. Using alternative deployment..."

    # Check if services are already running and stop them
    print_step "Stopping any existing services..."
    pkill -f "node.*3001" 2>/dev/null || true
    pkill -f "python.*8001" 2>/dev/null || true    # Install dependencies
    print_step "Installing dependencies..."
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ]; then
            npm install --legacy-peer-deps --production 2>/dev/null || npm install --legacy-peer-deps
        fi
        print_success "Frontend dependencies ready"
    fi

    if [ -f "backend/package.json" ]; then
        if [ ! -d "backend/node_modules" ]; then
            cd backend && npm install --production 2>/dev/null || npm install && cd ..
        else
            cd backend && cd ..
        fi
        print_success "Backend dependencies ready"
    fi

    if [ -f "ai-service/requirements.txt" ]; then
        cd ai-service && pip3 install -r requirements.txt &>/dev/null && cd ..
        print_success "AI Service dependencies ready"
    fi

    # Build frontend
    if [ -f "package.json" ]; then
        if [ ! -d "build" ]; then
            print_step "Building frontend..."
            npm run build &>/dev/null
            print_success "Frontend built successfully"
        else
            print_success "Frontend build already exists"
        fi
    fi

    # Start services in background
    print_step "Starting services..."

    # Start AI Service
    if [ -f "ai-service/main.py" ]; then
        cd ai-service
        nohup python3 main.py > ../logs/ai-service.log 2>&1 &
        cd ..
        print_success "AI Service started on port 8001"
    fi

    # Start Backend
    if [ -f "backend/src/server.js" ]; then
        cd backend
        nohup node src/server.js > ../logs/backend.log 2>&1 &
        cd ..
        print_success "Backend started on port 3001"
    fi

    # Serve frontend (if build exists)
    if [ -d "build" ]; then
        if command -v python3 &> /dev/null; then
            cd build
            nohup python3 -m http.server 80 > ../logs/frontend.log 2>&1 &
            cd ..
            print_success "Frontend served on port 80"
        else
            print_warning "Frontend built but no server available. Use: cd build && python3 -m http.server 80"
        fi
    fi

    sleep 3
    print_success "Services started successfully!"
}

# Main script logic
main() {
    check_directory

    case "${1:-help}" in
        "start")
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$@"
            ;;
        "test")
            run_tests
            ;;
        "health")
            health_check
            ;;
        "build")
            build_images
            ;;
        "clean")
            clean_docker
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
