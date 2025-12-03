import json
import os
import psycopg2
from typing import Dict, Any, Optional, List
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram bot webhook + DB API for Банный Клуб
    Args: event - dict with httpMethod, body, queryStringParameters, pathParams
          context - object with request_id, function_name attributes
    Returns: HTTP response dict with statusCode, headers, body
    '''
    method: str = event.get('httpMethod', 'POST')
    raw_path = event.get('url', '')
    path = raw_path.strip('/').split('/')[-1] if raw_path else ''
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if path in ['members', 'events', 'stats', 'messages', 'send-message']:
        return handle_db_request(method, path, event)
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    database_url = os.environ.get('DATABASE_URL', '')
    
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Bot token not configured'})
        }
    
    try:
        body_raw = event.get('body', '{}')
        print(f"Received webhook body: {body_raw}")
        update = json.loads(body_raw)
        print(f"Parsed update: {update}")
        
        if 'message' not in update:
            print("No message in update, skipping")

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        message = update['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        print(f"Processing message: {text} from chat_id: {chat_id}")
        user = message['from']
        
        telegram_id = user['id']
        first_name = user.get('first_name', '')
        last_name = user.get('last_name', '')
        username = user.get('username', '')
        full_name = f"{first_name} {last_name}".strip() or username or str(telegram_id)
        
        print(f"Connecting to database...")
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        print(f"Database connected successfully")
        
        response_text = ''
        
        if text.startswith('/start'):
            print(f"Processing /start command for user {telegram_id}")
            cur.execute(
                f"SELECT id FROM members WHERE telegram_id = {int(telegram_id)}"
            )
            existing = cur.fetchone()
            
            if not existing:
                print(f"New user, inserting into database")
                escaped_full_name = full_name.replace("'", "''")
                today_date = datetime.now().date().isoformat()
                cur.execute(
                    f"INSERT INTO members (name, telegram_id, joined_at, status) VALUES ('{escaped_full_name}', {int(telegram_id)}, '{today_date}', 'new') RETURNING id"
                )
                conn.commit()
                
                response_text = f'''Привет, {first_name}! 🧖

Добро пожаловать в Банный Клуб!

Я помогу тебе:
🔹 Записаться на мероприятия
🔹 Узнать о предстоящих парениях
🔹 Получить информацию о банях и пармастерах

Используй /help для списка команд'''
                print(f"Set welcome response_text for new user")
            else:
                response_text = f'С возвращением, {first_name}! 👋\n\nИспользуй /help для списка команд'
                print(f"Set welcome back response_text for existing user")
        
        elif text.startswith('/help'):
            response_text = '''📋 Доступные команды:

/events - Ближайшие мероприятия
/myevents - Мои записи
/profile - Мой профиль
/help - Эта справка

По вопросам пишите администратору'''
        
        elif text.startswith('/events'):
            cur.execute('''
                SELECT 
                    e.id,
                    e.title,
                    e.date,
                    e.time,
                    e.location,
                    e.capacity,
                    e.format,
                    COUNT(er.member_id) as registered
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE e.date >= CURRENT_DATE
                GROUP BY e.id
                ORDER BY e.date, e.time
                LIMIT 5
            ''')
            
            events = cur.fetchall()
            
            if not events:
                response_text = 'Пока нет запланированных мероприятий 😔'
            else:
                response_text = '🗓 Ближайшие мероприятия:\n\n'
                for evt in events:
                    evt_id, title, date, time, location, capacity, fmt, registered = evt
                    format_emoji = {'women': '👭', 'men': '👬', 'mixed': '👫'}
                    emoji = format_emoji.get(fmt, '🧖')
                    
                    response_text += f'''{emoji} {title}
📅 {date.strftime("%d.%m.%Y")} в {time.strftime("%H:%M")}
📍 {location}
👥 Записано: {registered}/{capacity}
/register_{evt_id}

'''
        
        elif text.startswith('/register_'):
            try:
                event_id = int(text.split('_')[1])
                
                cur.execute(f"SELECT id FROM members WHERE telegram_id = {int(telegram_id)}")
                member = cur.fetchone()
                
                if not member:
                    response_text = 'Сначала используйте /start для регистрации'
                else:
                    member_id = member[0]
                    
                    cur.execute(
                        f"SELECT id FROM event_registrations WHERE event_id = {int(event_id)} AND member_id = {int(member_id)}"
                    )
                    existing_reg = cur.fetchone()
                    
                    if existing_reg:
                        response_text = 'Вы уже записаны на это мероприятие ✅'
                    else:
                        cur.execute(
                            f"SELECT capacity, (SELECT COUNT(*) FROM event_registrations WHERE event_id = {int(event_id)}) as registered FROM events WHERE id = {int(event_id)}"
                        )
                        capacity_check = cur.fetchone()
                        
                        if capacity_check and capacity_check[1] >= capacity_check[0]:
                            response_text = 'К сожалению, все места заняты 😔'
                        else:
                            now_timestamp = datetime.now().isoformat()
                            cur.execute(
                                f"INSERT INTO event_registrations (event_id, member_id, registered_at) VALUES ({int(event_id)}, {int(member_id)}, '{now_timestamp}')"
                            )
                            conn.commit()
                            response_text = 'Отлично! Вы записаны на мероприятие 🎉'
            except (ValueError, IndexError):
                response_text = 'Неверный формат команды'
        
        elif text.startswith('/myevents'):
            cur.execute(f"SELECT id FROM members WHERE telegram_id = {int(telegram_id)}")
            member = cur.fetchone()
            
            if not member:
                response_text = 'Сначала используйте /start для регистрации'
            else:
                member_id = member[0]
                
                cur.execute(f'''
                    SELECT 
                        e.title,
                        e.date,
                        e.time,
                        e.location,
                        er.attended
                    FROM event_registrations er
                    JOIN events e ON er.event_id = e.id
                    WHERE er.member_id = {int(member_id)} AND e.date >= CURRENT_DATE
                    ORDER BY e.date, e.time
                ''')
                
                my_events = cur.fetchall()
                
                if not my_events:
                    response_text = 'У вас пока нет записей на мероприятия\n\nИспользуйте /events для просмотра доступных мероприятий'
                else:
                    response_text = '📝 Ваши записи:\n\n'
                    for evt in my_events:
                        title, date, time, location, attended = evt
                        emoji = '🎉' if attended else '✅'
                        
                        response_text += f'''{emoji} {title}
📅 {date.strftime("%d.%m.%Y")} в {time.strftime("%H:%M")}
📍 {location}

'''
        
        elif text.startswith('/profile'):
            cur.execute(f"SELECT id FROM members WHERE telegram_id = {int(telegram_id)}")
            member = cur.fetchone()
            
            if not member:
                response_text = 'Сначала используйте /start для регистрации'
            else:
                member_id = member[0]
                
                cur.execute(f'''
                    SELECT 
                        m.name,
                        m.joined_at,
                        m.status,
                        COUNT(DISTINCT CASE WHEN er.attended = true THEN er.event_id END) as events_attended
                    FROM members m
                    LEFT JOIN event_registrations er ON m.id = er.member_id
                    WHERE m.id = {int(member_id)}
                    GROUP BY m.id, m.name, m.joined_at, m.status
                ''')
                
                profile = cur.fetchone()
                
                if profile:
                    name, joined, status, attended = profile
                    response_text = f'''👤 Ваш профиль

Имя: {name}
Дата регистрации: {joined.strftime("%d.%m.%Y")}
Статус: {status}
Посещено мероприятий: {attended}'''
        
        else:
            if text.startswith('/'):
                response_text = 'Неизвестная команда. Используйте /help для списка команд'
        
        print(f"Response text set: '{response_text[:100] if response_text else 'EMPTY'}'")
        
        escaped_text = text.replace("'", "''")
        now_timestamp = datetime.now().isoformat()
        cur.execute(
            f"INSERT INTO messages (telegram_id, message_text, sender_type, created_at) VALUES ({int(telegram_id)}, '{escaped_text}', 'member', '{now_timestamp}')"
        )
        conn.commit()
        print(f"Incoming message saved to DB")
        
        if response_text:
            print(f"response_text is not empty, proceeding to send")
            
            import urllib.request
            import urllib.parse
            
            escaped_response = response_text.replace("'", "''")
            cur.execute(
                f"INSERT INTO messages (telegram_id, message_text, sender_type, created_at) VALUES ({int(chat_id)}, '{escaped_response}', 'admin', '{now_timestamp}')"
            )
            conn.commit()
            
            print(f"Sending response to {chat_id}: {response_text[:50]}...")
            try:
                url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                data = urllib.parse.urlencode({
                    'chat_id': chat_id,
                    'text': response_text
                }).encode()
                
                req = urllib.request.Request(url, data=data)
                response = urllib.request.urlopen(req, timeout=10)
                result = response.read().decode()
                print(f"Message sent successfully: {result}")
            except Exception as send_error:
                print(f"Failed to send message: {send_error}")
                import traceback
                print(traceback.format_exc())
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }


def handle_db_request(method: str, path: str, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Handle database API requests'''
    database_url = os.environ.get('DATABASE_URL', '')
    
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if path == 'members':
            if method == 'GET':
                cur.execute('''
                    SELECT 
                        m.id,
                        m.name,
                        m.telegram_id,
                        m.phone,
                        m.joined_at,
                        m.status,
                        COUNT(DISTINCT er.event_id) as events_count
                    FROM members m
                    LEFT JOIN event_registrations er ON m.id = er.member_id
                    GROUP BY m.id
                    ORDER BY m.joined_at DESC
                ''')
                
                members = []
                for row in cur.fetchall():
                    members.append({
                        'id': row[0],
                        'name': row[1],
                        'telegram_id': row[2],
                        'username': row[3],
                        'joined_date': row[4].isoformat() if row[4] else None,
                        'status': row[5],
                        'events_count': row[6]
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(members)
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                name = body.get('name', '')
                telegram_id = body.get('telegram_id')
                username = body.get('username', '')
                status = body.get('status', 'new')
                
                escaped_name = name.replace("'", "''")
                escaped_username = username.replace("'", "''")
                escaped_status = status.replace("'", "''")
                today_date = datetime.now().date().isoformat()
                
                cur.execute(
                    f"INSERT INTO members (name, telegram_id, username, joined_date, status) VALUES ('{escaped_name}', {int(telegram_id) if telegram_id else 'NULL'}, '{escaped_username}', '{today_date}', '{escaped_status}') RETURNING id, name, telegram_id, username, joined_date, status"
                )
                
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'id': result[0],
                        'name': result[1],
                        'telegram_id': result[2],
                        'username': result[3],
                        'joined_date': result[4].isoformat() if result[4] else None,
                        'status': result[5]
                    })
                }
        
        elif path == 'events':
            if method == 'GET':
                cur.execute('''
                    SELECT 
                        e.id,
                        e.title,
                        e.description,
                        e.event_date,
                        e.start_time,
                        e.end_time,
                        e.location,
                        e.capacity,
                        e.format,
                        e.parmaster,
                        e.price,
                        COUNT(er.member_id) as registered
                    FROM events e
                    LEFT JOIN event_registrations er ON e.id = er.event_id
                    GROUP BY e.id
                    ORDER BY e.event_date DESC, e.start_time DESC
                ''')
                
                events = []
                for row in cur.fetchall():
                    events.append({
                        'id': row[0],
                        'title': row[1],
                        'description': row[2],
                        'event_date': row[3].isoformat() if row[3] else None,
                        'start_time': row[4].isoformat() if row[4] else None,
                        'end_time': row[5].isoformat() if row[5] else None,
                        'location': row[6],
                        'capacity': row[7],
                        'format': row[8],
                        'parmaster': row[9],
                        'price': row[10],
                        'registered': row[11]
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(events)
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                
                title = body.get('title', '').replace("'", "''")
                description = body.get('description', '').replace("'", "''")
                event_date = body.get('event_date', '')
                start_time = body.get('start_time', '')
                end_time = body.get('end_time', '')
                location = body.get('location', '').replace("'", "''")
                capacity = int(body.get('capacity', 10))
                format_val = body.get('format', 'mixed').replace("'", "''")
                parmaster = body.get('parmaster', '').replace("'", "''")
                price = int(body.get('price', 0))
                
                cur.execute(
                    f"INSERT INTO events (title, description, event_date, start_time, end_time, location, capacity, format, parmaster, price) VALUES ('{title}', '{description}', '{event_date}', '{start_time}', '{end_time}', '{location}', {capacity}, '{format_val}', '{parmaster}', {price}) RETURNING id, title, description, event_date, start_time, end_time, location, capacity, format, parmaster, price"
                )
                
                result = cur.fetchone()
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'id': result[0],
                        'title': result[1],
                        'description': result[2],
                        'event_date': result[3].isoformat() if result[3] else None,
                        'start_time': result[4].isoformat() if result[4] else None,
                        'end_time': result[5].isoformat() if result[5] else None,
                        'location': result[6],
                        'capacity': result[7],
                        'format': result[8],
                        'parmaster': result[9],
                        'price': result[10]
                    })
                }
        
        elif path == 'stats':
            cur.execute("SELECT COUNT(*) FROM members")
            total_members = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM events WHERE event_date >= CURRENT_DATE")
            upcoming_events = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM event_registrations")
            total_registrations = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM messages")
            total_messages = cur.fetchone()[0]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'total_members': total_members,
                    'upcoming_events': upcoming_events,
                    'total_registrations': total_registrations,
                    'total_messages': total_messages
                })
            }
        
        elif path == 'messages':
            limit = int(event.get('queryStringParameters', {}).get('limit', 50))
            
            cur.execute(f'''
                SELECT 
                    m.id,
                    m.telegram_id,
                    m.message_text,
                    m.sender_type,
                    m.created_at,
                    m.is_read,
                    mem.name
                FROM messages m
                LEFT JOIN members mem ON m.telegram_id = mem.telegram_id
                ORDER BY m.created_at DESC
                LIMIT {int(limit)}
            ''')
            
            messages = []
            for row in cur.fetchall():
                messages.append({
                    'id': row[0],
                    'telegramId': row[1],
                    'text': row[2],
                    'sender': row[3],
                    'timestamp': row[4].isoformat() if row[4] else None,
                    'isRead': row[5],
                    'memberName': row[6]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(messages)
            }
        
        elif path == 'send-message':
            if method != 'POST':
                return {
                    'statusCode': 405,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Method not allowed'})
                }
            
            body = json.loads(event.get('body', '{}'))
            telegram_id = body.get('telegramId') or body.get('telegram_id')
            message_text = body.get('message') or body.get('message_text', '')
            admin_name = body.get('adminName', 'Администратор')
            
            bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
            
            if not bot_token:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Bot token not configured'})
                }
            
            import urllib.request
            import urllib.parse
            
            try:
                url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                data = urllib.parse.urlencode({
                    'chat_id': telegram_id,
                    'text': message_text
                }).encode()
                
                req = urllib.request.Request(url, data=data)
                response = urllib.request.urlopen(req, timeout=10)
                
                escaped_message_text = message_text.replace("'", "''")
                escaped_admin_name = admin_name.replace("'", "''")
                now_timestamp = datetime.now().isoformat()
                cur.execute(
                    f"INSERT INTO messages (telegram_id, message_text, sender_type, created_at, admin_name) VALUES ({int(telegram_id)}, '{escaped_message_text}', 'admin', '{now_timestamp}', '{escaped_admin_name}')"
                )
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'ok': True})
                }
            except Exception as e:
                cur.close()
                conn.close()
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': str(e)})
                }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Not found'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }