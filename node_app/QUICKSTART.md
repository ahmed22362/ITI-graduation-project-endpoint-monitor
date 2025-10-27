# 🚀 Quick Start Guide

Get the API Health Dashboard running in 5 minutes!

## Option 1: Docker (Easiest - Recommended)

### Prerequisites

- Docker installed
- Docker Compose installed

### Steps

```bash
# 1. Navigate to project directory
cd /home/ahmed/graduation_project

# 2. Start all services (MySQL, Redis, Application)
docker-compose up -d

# 3. Wait for services to be ready (~30 seconds)
docker-compose logs -f app

# 4. Open your browser
# Dashboard: http://localhost:3000
# Services: http://localhost:3000/services-page
# Team: http://localhost:3000/team
```

### Stop Services

```bash
docker-compose down
```

---

## Option 2: Local Development

### Prerequisites

- Node.js 18+
- MySQL 8.0 running
- Redis 7.x running

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Edit .env file with your credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=api_health_dashboard
# REDIS_HOST=localhost

# 4. Create database
mysql -u root -p
CREATE DATABASE api_health_dashboard;
exit;

# 5. Start the application
npm start

# 6. Open browser to http://localhost:3000
```

---

## 🎯 First Steps After Installation

### 1. View Dashboard

Navigate to `http://localhost:3000` to see the main dashboard.

### 2. Add Your First Service

1. Click "Add Service" button
2. Fill in the form:
   - **Name**: GitHub API
   - **URL**: https://api.github.com
   - **Check Interval**: 60 (seconds)
   - **Expected Status**: 200
   - **Timeout**: 5000 (milliseconds)
3. Click "Save Service"

### 3. Monitor Service Health

- The dashboard will automatically check the service
- Status updates appear in real-time
- Click "Check Now" to force an immediate check

### 4. View Team

Navigate to `http://localhost:3000/team` to see the team members.

---

## 📊 Sample Services to Monitor

Here are some public APIs you can add for testing:

### GitHub API

- **Name**: GitHub API
- **URL**: https://api.github.com
- **Expected Status**: 200

### JSONPlaceholder

- **Name**: JSONPlaceholder
- **URL**: https://jsonplaceholder.typicode.com/posts/1
- **Expected Status**: 200

### HTTPBin

- **Name**: HTTPBin Status
- **URL**: https://httpbin.org/status/200
- **Expected Status**: 200

### Public APIs Directory

- **Name**: Public APIs
- **URL**: https://api.publicapis.org/entries
- **Expected Status**: 200

---

## 🧪 Testing the API

### Check Application Health

```bash
curl http://localhost:3000/api/health
```

### Get All Services

```bash
curl http://localhost:3000/api/services
```

### Get Metrics

```bash
curl http://localhost:3000/api/metrics
```

### Add a Service via API

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test API",
    "url": "https://api.github.com",
    "check_interval": 60,
    "expected_status": 200,
    "timeout": 5000
  }'
```

---

## 🔧 Troubleshooting

### Docker Issues

**Problem**: Services won't start

```bash
# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

**Problem**: Port 3000 already in use

```bash
# Edit docker-compose.yml and change ports
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Database Issues

**Problem**: Database connection failed

1. Check MySQL is running
2. Verify credentials in `.env`
3. Ensure database exists

```bash
# Create database manually
mysql -u root -p
CREATE DATABASE api_health_dashboard;
exit;
```

### Redis Issues

**Problem**: Cache not working

1. Check Redis is running
2. Verify Redis connection in logs
3. Application will work without Redis (just slower)

---

## 📱 Access Points

| Page        | URL                                 | Description          |
| ----------- | ----------------------------------- | -------------------- |
| Dashboard   | http://localhost:3000               | Main monitoring page |
| Services    | http://localhost:3000/services-page | Manage services      |
| Team        | http://localhost:3000/team          | Team information     |
| API Health  | http://localhost:3000/api/health    | System health        |
| API Metrics | http://localhost:3000/api/metrics   | Statistics           |

---

## 🎨 Features to Try

1. **Auto-refresh**: Dashboard updates every 30 seconds automatically
2. **Force Check**: Click "Check Now" to immediately test a service
3. **Edit Service**: Modify check intervals and timeouts
4. **Delete Service**: Remove services you no longer need
5. **View Status**: Click "View" to see detailed service information
6. **Responsive Design**: Try on mobile, tablet, and desktop

---

## 🎓 Next Steps

1. ✅ Add your production APIs to monitor
2. ✅ Set appropriate check intervals
3. ✅ Configure expected status codes
4. ✅ Set up alerts (future feature)
5. ✅ Integrate with your CI/CD pipeline

---

## 💡 Pro Tips

- Use shorter intervals (30-60s) for critical services
- Use longer intervals (300-600s) for less critical services
- Monitor the dashboard metrics to track overall health
- Check the health endpoint for orchestrator integration
- Use the API endpoints in your automation scripts

---

**Happy Monitoring! 🚀**

Need help? Check the [full README](./README.md) for detailed documentation.
