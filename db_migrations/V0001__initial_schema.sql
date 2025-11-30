-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    telegram_id BIGINT UNIQUE,
    phone VARCHAR(50),
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    events_attended INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create member_preferences table
CREATE TABLE IF NOT EXISTS member_preferences (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    format VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    format VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    member_id INTEGER REFERENCES members(id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(event_id, member_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_telegram_id ON members(telegram_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_member_id ON event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_member_preferences_member_id ON member_preferences(member_id);

-- Insert sample data for members
INSERT INTO members (name, telegram_id, joined_at, events_attended, status) VALUES
('Анна Смирнова', 123456789, '2024-03-15', 12, 'active'),
('Дмитрий Волков', 987654321, '2024-06-20', 8, 'active'),
('Екатерина Петрова', 555666777, '2024-09-01', 3, 'new');

-- Insert member preferences
INSERT INTO member_preferences (member_id, format) VALUES
(1, 'women'),
(1, 'soft'),
(2, 'men'),
(2, 'hot'),
(3, 'mixed'),
(3, 'soft');

-- Insert sample events
INSERT INTO events (title, date, time, location, format, capacity, description, status) VALUES
('Женская баня с пармастером', '2025-12-05', '18:00', 'Баня на Сретенке', 'women', 12, 'Мягкий пар, купель, травяной чай', 'upcoming'),
('Мужская баня. Классический пар', '2025-12-07', '19:00', 'Сандуны', 'men', 15, 'Классический русский пар', 'upcoming'),
('Совместная баня + купель', '2025-12-10', '20:00', 'Усадьба Банная', 'mixed', 20, 'Совместная баня с контрастными процедурами', 'upcoming');

-- Insert event registrations
INSERT INTO event_registrations (event_id, member_id) VALUES
(1, 1),
(1, 3),
(2, 2);
