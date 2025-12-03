-- Таблица для хранения сообщений между администраторами и участниками
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    telegram_id BIGINT NOT NULL,
    message_text TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('member', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    admin_name VARCHAR(255)
);

CREATE INDEX idx_messages_member_id ON messages(member_id);
CREATE INDEX idx_messages_telegram_id ON messages(telegram_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);