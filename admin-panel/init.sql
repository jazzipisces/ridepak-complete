-- Database initialization script for Ride Hailing Admin Panel
-- This script creates the basic database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'blocked');
CREATE TYPE driver_status AS ENUM ('pending', 'active', 'inactive', 'suspended', 'blocked', 'online', 'offline', 'busy');
CREATE TYPE ride_status AS ENUM ('pending', 'confirmed', 'driver_assigned', 'driver_arrived', 'in_progress', 'completed', 'cancelled', 'cancelled_by_driver', 'cancelled_by_customer', 'cancelled_by_admin');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions TEXT[],
    avatar_url VARCHAR(500),
    status user_status DEFAULT 'active',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    avatar_url VARCHAR(500),
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    status driver_status DEFAULT 'pending',
    online_status driver_status DEFAULT 'offline',
    rating DECIMAL(3,2) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    last_location_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(50),
    status user_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document types reference
CREATE TABLE document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver documents table
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    document_type_id UUID REFERENCES document_types(id),
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    status document_status DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES admin_users(id),
    reviewed_at TIMESTAMP,
    expires_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rides table
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    driver_id UUID REFERENCES drivers(id),
    status ride_status DEFAULT 'pending',
    pickup_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10,8) NOT NULL,
    pickup_longitude DECIMAL(11,8) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_latitude DECIMAL(10,8) NOT NULL,
    destination_longitude DECIMAL(11,8) NOT NULL,
    estimated_distance DECIMAL(8,2),
    estimated_duration INTEGER,
    actual_distance DECIMAL(8,2),
    actual_duration INTEGER,
    fare DECIMAL(10,2),
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    special_requests TEXT,
    driver_rating INTEGER CHECK (driver_rating BETWEEN 1 AND 5),
    customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
    driver_comment TEXT,
    customer_comment TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID REFERENCES rides(id),
    customer_id UUID REFERENCES customers(id),
    driver_id UUID REFERENCES drivers(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(255),
    status payment_status DEFAULT 'pending',
    gateway_response JSONB,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver earnings table
CREATE TABLE driver_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id),
    ride_id UUID REFERENCES rides(id),
    base_fare DECIMAL(10,2),
    distance_fare DECIMAL(10,2),
    time_fare DECIMAL(10,2),
    surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
    commission_rate DECIMAL(3,2),
    commission_amount DECIMAL(10,2),
    driver_amount DECIMAL(10,2),
    tips DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2),
    payout_status VARCHAR(50) DEFAULT 'pending',
    payout_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_type VARCHAR(20) NOT NULL, -- 'admin', 'driver', 'customer'
    recipient_id UUID,
    sender_type VARCHAR(20) DEFAULT 'system',
    sender_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- System logs table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- 'info', 'warn', 'error', 'debug'
    message TEXT NOT NULL,
    metadata JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at);

CREATE INDEX idx_drivers_email ON drivers(email);
CREATE INDEX idx_drivers_phone ON drivers(phone);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_online_status ON drivers(online_status);
CREATE INDEX idx_drivers_location ON drivers(current_latitude, current_longitude);
CREATE INDEX idx_drivers_created_at ON drivers(created_at);

CREATE INDEX idx_rides_customer_id ON rides(customer_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_created_at ON rides(created_at);
CREATE INDEX idx_rides_requested_at ON rides(requested_at);

CREATE INDEX idx_payments_ride_id ON payments(ride_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- Insert default document types
INSERT INTO document_types (name, description, required) VALUES
('Driver License', 'Valid driver license', true),
('Vehicle Registration', 'Vehicle registration certificate', true),
('Insurance Certificate', 'Vehicle insurance certificate', true),
('Profile Photo', 'Driver profile photograph', true),
('Background Check', 'Criminal background check report', false);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category) VALUES
('base_fare', '{"amount": 2.50, "currency": "USD"}', 'Base fare for rides', 'pricing'),
('per_km_rate', '{"amount": 1.20, "currency": "USD"}', 'Rate per kilometer', 'pricing'),
('per_minute_rate', '{"amount": 0.25, "currency": "USD"}', 'Rate per minute', 'pricing'),
('minimum_fare', '{"amount": 5.00, "currency": "USD"}', 'Minimum fare amount', 'pricing'),
('commission_rate', '{"rate": 0.20}', 'Platform commission rate (20%)', 'pricing'),
('surge_pricing_enabled', '{"enabled": true}', 'Enable surge pricing', 'pricing'),
('max_search_radius', '{"radius": 10, "unit": "km"}', 'Maximum driver search radius', 'system'),
('ride_timeout', '{"minutes": 5}', 'Ride request timeout in minutes', 'system'),
('driver_arrival_threshold', '{"meters": 100}', 'Distance threshold for driver arrival', 'system'),
('rating_required', '{"enabled": true}', 'Require ratings after ride completion', 'system'),
('auto_assign_drivers', '{"enabled": false}', 'Automatically assign nearest driver', 'system'),
('support_email', '{"email": "support@rideapp.com"}', 'Support email address', 'contact'),
('support_phone', '{"phone": "+1-800-RIDE-APP"}', 'Support phone number', 'contact');

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, first_name, last_name, role, permissions) VALUES
('admin@example.com', '$2b$10$XYZ...', 'Super', 'Admin', 'super_admin', 
 ARRAY['*', 'users.manage', 'drivers.manage', 'rides.manage', 'payments.view', 'settings.manage', 'analytics.view']);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_documents_updated_at BEFORE UPDATE ON driver_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for analytics
CREATE VIEW ride_analytics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_rides,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_rides,
    COUNT(*) FILTER (WHERE status LIKE 'cancelled%') as cancelled_rides,
    AVG(total_amount) FILTER (WHERE status = 'completed') as avg_fare,
    AVG(actual_duration) FILTER (WHERE status = 'completed') as avg_duration,
    AVG(actual_distance) FILTER (WHERE status = 'completed') as avg_distance
FROM rides
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE VIEW driver_analytics AS
SELECT 
    d.id,
    d.first_name,
    d.last_name,
    d.status,
    d.online_status,
    d.rating,
    COUNT(r.id) as total_rides,
    COUNT(r.id) FILTER (WHERE r.status = 'completed') as completed_rides,
    SUM(de.total_earnings) as total_earnings,
    AVG(r.driver_rating) as avg_customer_rating
FROM drivers d
LEFT JOIN rides r ON d.id = r.driver_id
LEFT JOIN driver_earnings de ON d.id = de.driver_id
GROUP BY d.id, d.first_name, d.last_name, d.status, d.online_status, d.rating;

CREATE VIEW customer_analytics AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.status,
    c.rating,
    COUNT(r.id) as total_rides,
    COUNT(r.id) FILTER (WHERE r.status = 'completed') as completed_rides,
    SUM(r.total_amount) FILTER (WHERE r.status = 'completed') as total_spent,
    AVG(r.customer_rating) as avg_driver_rating
FROM customers c
LEFT JOIN rides r ON c.id = r.customer_id
GROUP BY c.id, c.first_name, c.last_name, c.status, c.rating;

-- Create function for distance calculation (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $
DECLARE
    R CONSTANT DECIMAL := 6371; -- Earth radius in kilometers
    dLat DECIMAL;
    dLng DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := RADIANS(lat2 - lat1);
    dLng := RADIANS(lng2 - lng1);
    
    a := SIN(dLat/2) * SIN(dLat/2) + 
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
         SIN(dLng/2) * SIN(dLng/2);
    
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c;
END;
$ LANGUAGE plpgsql;

-- Create function to find nearby drivers
CREATE OR REPLACE FUNCTION find_nearby_drivers(
    pickup_lat DECIMAL, 
    pickup_lng DECIMAL, 
    radius_km DECIMAL DEFAULT 10
) RETURNS TABLE (
    driver_id UUID,
    distance_km DECIMAL,
    first_name VARCHAR,
    last_name VARCHAR,
    rating DECIMAL
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        calculate_distance(pickup_lat, pickup_lng, d.current_latitude, d.current_longitude) as distance,
        d.first_name,
        d.last_name,
        d.rating
    FROM drivers d
    WHERE d.online_status = 'online'
      AND d.status = 'active'
      AND d.current_latitude IS NOT NULL
      AND d.current_longitude IS NOT NULL
      AND calculate_distance(pickup_lat, pickup_lng, d.current_latitude, d.current_longitude) <= radius_km
    ORDER BY distance ASC;
END;
$ LANGUAGE plpgsql;

-- Sample data for testing (optional - remove in production)
/*
-- Insert sample customers
INSERT INTO customers (email, phone, first_name, last_name, email_verified, phone_verified) VALUES
('john.doe@example.com', '+1234567890', 'John', 'Doe', true, true),
('jane.smith@example.com', '+1234567891', 'Jane', 'Smith', true, true),
('bob.johnson@example.com', '+1234567892', 'Bob', 'Johnson', true, false);

-- Insert sample drivers
INSERT INTO drivers (email, phone, first_name, last_name, date_of_birth, license_number, status, online_status, current_latitude, current_longitude) VALUES
('driver1@example.com', '+1234567893', 'Mike', 'Wilson', '1985-05-15', 'DL123456789', 'active', 'online', 40.7128, -74.0060),
('driver2@example.com', '+1234567894', 'Sarah', 'Davis', '1990-08-22', 'DL987654321', 'active', 'offline', 40.7589, -73.9851),
('driver3@example.com', '+1234567895', 'Tom', 'Brown', '1988-03-10', 'DL555666777', 'pending', 'offline', NULL, NULL);

-- Insert sample vehicles
INSERT INTO vehicles (driver_id, make, model, year, color, license_plate) 
SELECT id, 'Toyota', 'Camry', 2020, 'White', 'ABC' || LPAD((ROW_NUMBER() OVER())::TEXT, 3, '0')
FROM drivers 
WHERE email IN ('driver1@example.com', 'driver2@example.com');
*/

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;