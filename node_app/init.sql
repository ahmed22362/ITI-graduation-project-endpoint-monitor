-- Initialize database with sample data
USE api_health_dashboard;

-- Insert sample services
INSERT INTO services (name, url, check_interval, expected_status, timeout) VALUES
('GitHub API', 'https://api.github.com', 60, 200, 5000),
('JSONPlaceholder', 'https://jsonplaceholder.typicode.com/posts/1', 120, 200, 3000),
('HTTPBin Status 200', 'https://httpbin.org/status/200', 300, 200, 5000);

-- Initial health check data will be populated by the application
