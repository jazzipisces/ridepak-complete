# Ride Hailing Admin Panel

A comprehensive admin dashboard for managing ride-hailing operations, drivers, customers, and analytics in real-time.

## 🚀 Features

### Core Management
- **Real-time Dashboard** - Live statistics, charts, and system monitoring
- **Ride Management** - Monitor, track, and manage all ride requests
- **Driver Management** - Onboard, monitor, and manage driver accounts
- **Customer Management** - Handle customer accounts and support
- **Financial Management** - Track earnings, payments, and payouts
- **Analytics & Reports** - Comprehensive data analysis and reporting

### Real-time Features
- Live ride tracking and status updates
- Real-time driver location monitoring
- Instant notifications and alerts
- Live system performance metrics
- Real-time chat and communication

### Integration Capabilities
- Seamless integration with customer and driver mobile apps
- REST API integration
- WebSocket real-time communication
- Push notification system
- Third-party service integrations (maps, payments)

## 🏗️ Project Structure

```
admin-panel/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── RideManagement.jsx
│   │   ├── DriverManagement.jsx
│   │   ├── CustomerManagement.jsx
│   │   ├── Analytics.jsx
│   │   ├── Settings.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Login.jsx
│   │   └── NotificationManager.jsx
│   ├── services/
│   │   ├── APIService.js
│   │   ├── SocketService.js
│   │   └── AuthService.js
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── index.js
│   └── App.css
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- Backend API server running
- Database (MySQL/PostgreSQL)
- Redis (for caching and sessions)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_MAPS_API_KEY=your_google_maps_key
   REACT_APP_FCM_KEY=your_fcm_key
   REACT_APP_ENVIRONMENT=development
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Access the admin panel**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login Credentials
- **Email**: admin@example.com
- **Password**: admin123

## 🔧 Configuration

### API Configuration
The admin panel connects to your backend API. Configure the endpoints in `src/services/APIService.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
```

### Socket Configuration
Real-time features use Socket.IO. Configure in `src/services/SocketService.js`:

```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
```

### Authentication
Admin authentication is handled through JWT tokens. The system supports:
- Login/Logout
- Token refresh
- Role-based access control
- Session management

## 📱 Integration with Mobile Apps

### Customer App Integration
- Real-time ride status updates
- Customer support and communication
- Account management and verification
- Push notifications

### Driver App Integration
- Driver onboarding and verification
- Real-time location tracking
- Earnings and payout management
- Performance monitoring

### Shared Backend
All applications (admin, customer, driver) share the same backend APIs:
- User authentication
- Ride management
- Payment processing
- Notification system

## 🔌 API Endpoints

### Authentication
```
POST /api/admin/auth/login
POST /api/admin/auth/logout
GET  /api/admin/auth/verify
PUT  /api/admin/auth/profile
```

### Ride Management
```
GET  /api/admin/rides
GET  /api/admin/rides/:id
PUT  /api/admin/rides/:id/status
POST /api/admin/rides/:id/assign
```

### Driver Management
```
GET  /api/admin/drivers
POST /api/admin/drivers
PUT  /api/admin/drivers/:id
PUT  /api/admin/drivers/:id/status
```

### Customer Management
```
GET  /api/admin/customers
PUT  /api/admin/customers/:id
PUT  /api/admin/customers/:id/status
```

### Analytics
```
GET  /api/admin/analytics
GET  /api/admin/analytics/revenue
GET  /api/admin/analytics/performance
```

## 🔄 Real-time Events

### Socket.IO Events

#### Incoming Events (Admin Panel Listens)
- `ride_created` - New ride request
- `ride_updated` - Ride status change
- `driver_online` - Driver comes online
- `driver_offline` - Driver goes offline
- `customer_registered` - New customer registration
- `payment_completed` - Payment processed
- `emergency_alert` - Emergency situation

#### Outgoing Events (Admin Panel Emits)
- `admin_broadcast_drivers` - Message to all drivers
- `admin_broadcast_customers` - Message to all customers
- `admin_notify_driver` - Notification to specific driver
- `admin_notify_customer` - Notification to specific customer
- `admin_cancel_ride` - Cancel ride (admin override)
- `admin_force_driver_offline` - Force driver offline

## 📊 Dashboard Features

### Key Metrics
- Total rides (daily/weekly/monthly)
- Online drivers count
- Revenue statistics
- Customer satisfaction ratings
- System performance indicators

### Real-time Charts
- Revenue trends
- Ride status distribution
- Driver activity patterns
- Geographic heat maps
- Peak hour analysis

### System Monitoring
- API response times
- Database performance
- Active connections
- Error rates
- Server resources

## 🛡️ Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Session timeout management
- Multi-factor authentication support

### Data Protection
- API rate limiting
- Input validation and sanitization
- XSS and CSRF protection
- Secure HTTP headers
- Data encryption at rest

### Audit Logging
- Admin action logging
- API call monitoring
- Security event tracking
- Compliance reporting

## 📈 Performance Optimization

### Frontend Optimization
- Code splitting and lazy loading
- Component memoization
- Virtual scrolling for large lists
- Image optimization
- Bundle size optimization

### Backend Communication
- API request caching
- Debounced search queries
- Optimistic UI updates
- Efficient data pagination
- WebSocket connection pooling

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
npm run serve
```

### Docker Deployment
```bash
docker build -t ride-admin-panel .
docker run -p 3000:3000 ride-admin-panel
```

### Environment-specific Builds
```bash
npm run build:staging
npm run build:production
```

## 🔧 Troubleshooting

### Common Issues

#### Connection Issues
- Check API base URL configuration
- Verify backend server is running
- Check CORS settings
- Validate SSL certificates

#### Authentication Problems
- Clear browser cache and local storage
- Check JWT token expiration
- Verify user permissions
- Review API authentication headers

#### Real-time Features Not Working
- Check Socket.IO connection
- Verify WebSocket support
- Review firewall settings
- Check server Socket.IO configuration

### Debug Mode
Enable debug mode by setting:
```env
REACT_APP_DEBUG=true
```

## 📚 Documentation

### API Documentation
- [API Reference](docs/api-reference.md)
- [Authentication Guide](docs/authentication.md)
- [WebSocket Events](docs/websocket-events.md)

### Integration Guides
- [Customer App Integration](docs/customer-integration.md)
- [Driver App Integration](docs/driver-integration.md)
- [Backend Setup](docs/backend-setup.md)

### Deployment Guides
- [Production Deployment](docs/production-deployment.md)
- [Docker Setup](docs/docker-setup.md)
- [AWS Deployment](docs/aws-deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation
- Review troubleshooting guide

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core admin panel functionality
- Real-time dashboard
- Driver and customer management
- Integration with mobile apps
- Analytics and reporting

### Upcoming Features
- Advanced analytics dashboard
- Machine learning insights
- Multi-language support
- Advanced user roles
- Automated reporting
- Enhanced security features

---

**Built with ❤️ for efficient ride-hailing management**