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
    path = event.get('pathParams', {}).get('resource', '')
    
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
    
    if path in ['members', 'events', 'stats']:
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
        update = json.loads(event.get('body', '{}'))
        
        if 'message' not in update:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        message = update['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        user = message['from']
        
        telegram_id = user['id']
        first_name = user.get('first_name', '')
        last_name = user.get('last_name', '')
        username = user.get('username', '')
        full_name = f"{first_name} {last_name}".strip() or username or str(telegram_id)
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        response_text = ''
        
        if text.startswith('/start'):
            cur.execute(
                "SELECT id FROM members WHERE telegram_id = %s",
                (telegram_id,)
            )
            existing = cur.fetchone()
            
            if not existing:
                cur.execute(
                    "INSERT INTO members (name, telegram_id, username, joined_date, status) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (full_name, telegram_id, username, datetime.now().date(), 'new')
                )
                conn.commit()
                
                response_text = f'''Привет, {first_name}! 🧖

Добро пожаловать в Банный Клуб!

Я помогу тебе:
🔹 Записаться на мероприятия
🔹 Узнать о предстоящих парениях
🔹 Получить информацию о банях и пармастерах

Используй /help для списка команд'''
            else:
                response_text = f'С возвращением, {first_name}! 👋\n\nИспользуй /help для списка команд'
        
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
                    e.event_date,
                    e.start_time,
                    e.location,
                    e.capacity,
                    e.format,
                    COUNT(er.member_id) as registered
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                WHERE e.event_date >= CURRENT_DATE
                GROUP BY e.id
                ORDER BY e.event_date, e.start_time
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
                
                cur.execute("SELECT id FROM members WHERE telegram_id = %s", (telegram_id,))
                member = cur.fetchone()
                
                if not member:
                    response_text = 'Сначала используйте /start для регистрации'
                else:
                    member_id = member[0]
                    
                    cur.execute(
                        "SELECT id FROM event_registrations WHERE event_id = %s AND member_id = %s",
                        (event_id, member_id)
                    )
                    existing_reg = cur.fetchone()
                    
                    if existing_reg:
                        response_text = 'Вы уже записаны на это мероприятие ✅'
                    else:
                        cur.execute(
                            "SELECT capacity, (SELECT COUNT(*) FROM event_registrations WHERE event_id = %s) as registered FROM events WHERE id = %s",
                            (event_id, event_id)
                        )
                        capacity_check = cur.fetchone()
                        
                        if capacity_check and capacity_check[1] >= capacity_check[0]:
                            response_text = 'К сожалению, все места заняты 😔'
                        else:
                            cur.execute(
                                "INSERT INTO event_registrations (event_id, member_id, registered_at, status) VALUES (%s, %s, %s, %s)",
                                (event_id, member_id, datetime.now(), 'registered')
                            )
                            conn.commit()
                            response_text = 'Отлично! Вы записаны на мероприятие 🎉'
            except (ValueError, IndexError):
                response_text = 'Неверный формат команды'
        
        elif text.startswith('/myevents'):
            cur.execute("SELECT id FROM members WHERE telegram_id = %s", (telegram_id,))
            member = cur.fetchone()
            
            if not member:
                response_text = 'Сначала используйте /start для регистрации'
            else:
                member_id = member[0]
                
                cur.execute('''
                    SELECT 
                        e.title,
                        e.event_date,
                        e.start_time,
                        e.location,
                        er.status
                    FROM event_registrations er
                    JOIN events e ON er.event_id = e.id
                    WHERE er.member_id = %s AND e.event_date >= CURRENT_DATE
                    ORDER BY e.event_date, e.start_time
                ''', (member_id,))
                
                my_events = cur.fetchall()
                
                if not my_events:
                    response_text = 'У вас пока нет записей на мероприятия\n\nИспользуйте /events для просмотра доступных мероприятий'
                else:
                    response_text = '📝 Ваши записи:\n\n'
                    for evt in my_events:
                        title, date, time, location, status = evt
                        status_emoji = {'registered': '✅', 'attended': '🎉', 'cancelled': '❌'}
                        emoji = status_emoji.get(status, '📌')
                        
                        response_text += f'''{emoji} {title}
📅 {date.strftime("%d.%m.%Y")} в {time.strftime("%H:%M")}
📍 {location}

'''
        
        elif text.startswith('/profile'):
            cur.execute('''
                SELECT 
                    m.name,
                    m.joined_date,
                    m.status,
                    COUNT(DISTINCT er.event_id) as events_count,
                    ARRAY_AGG(DISTINCT mp.format ORDER BY mp.format) as formats
                FROM members m
                LEFT JOIN event_registrations er ON m.id = er.member_id
                LEFT JOIN member_preferences mp ON m.id = mp.member_id
                WHERE m.telegram_id = %s
                GROUP BY m.id, m.name, m.joined_date, m.status
            ''', (telegram_id,))
            
            profile = cur.fetchone()
            
            if not profile:
                response_text = 'Профиль не найден. Используйте /start для регистрации'
            else:
                name, joined, status, events_count, formats = profile
                
                format_names = {
                    'women': 'Женская',
                    'men': 'Мужская', 
                    'mixed': 'Совместная',
                    'soft': 'Мягкий пар',
                    'hot': 'Горячий пар'
                }
                
                prefs = ', '.join([format_names.get(f, f) for f in (formats or []) if f])
                
                response_text = f'''👤 Ваш профиль:

Имя: {name}
Статус: {"Новичок" if status == "new" else "Активный"}
В клубе с: {joined.strftime("%d.%m.%Y")}
Посещено мероприятий: {events_count}'''
                
                if prefs:
                    response_text += f'\nПредпочтения: {prefs}'
        
        else:
            response_text = 'Не понял команду 🤔\n\nИспользуйте /help для списка доступных команд'
        
        cur.close()
        conn.close()
        
        send_message(bot_token, chat_id, response_text)
        
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


def send_message(token: str, chat_id: int, text: str) -> None:
    import urllib.request
    import urllib.parse
    
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }).encode()
    
    req = urllib.request.Request(url, data=data)
    urllib.request.urlopen(req)


def handle_db_request(method: str, path: str, event: Dict[str, Any]) -> Dict[str, Any]:
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
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if path == 'members':
            cur.execute('''
                SELECT 
                    m.id,
                    m.name,
                    m.joined_date,
                    m.status,
                    COUNT(DISTINCT er.event_id) as events_count,
                    ARRAY_AGG(DISTINCT mp.format ORDER BY mp.format) as formats
                FROM members m
                LEFT JOIN event_registrations er ON m.id = er.member_id
                LEFT JOIN member_preferences mp ON m.id = mp.member_id
                GROUP BY m.id
                ORDER BY m.joined_date DESC
            ''')
            
            rows = cur.fetchall()
            members = []
            
            for row in rows:
                member_id, name, joined, status, events_count, formats = row
                members.append({
                    'id': member_id,
                    'name': name,
                    'joined': joined.strftime('%d.%m.%Y'),
                    'events': events_count or 0,
                    'format': [f for f in (formats or []) if f],
                    'status': status
                })
            
            result = members
        
        elif path == 'events':
            cur.execute('''
                SELECT 
                    e.id,
                    e.title,
                    e.event_date,
                    e.start_time,
                    e.location,
                    e.capacity,
                    e.format,
                    e.description,
                    COUNT(er.member_id) as registered
                FROM events e
                LEFT JOIN event_registrations er ON e.id = er.event_id
                GROUP BY e.id
                ORDER BY e.event_date, e.start_time
            ''')
            
            rows = cur.fetchall()
            events = []
            
            for row in rows:
                evt_id, title, date, time, location, capacity, fmt, desc, registered = row
                
                status = 'upcoming'
                if registered >= capacity:
                    status = 'full'
                
                events.append({
                    'id': evt_id,
                    'title': title,
                    'date': date.strftime('%d.%m.%Y'),
                    'time': time.strftime('%H:%M'),
                    'location': location,
                    'capacity': capacity,
                    'registered': registered,
                    'format': fmt,
                    'status': status,
                    'description': desc or ''
                })
            
            result = events
        
        elif path == 'stats':
            cur.execute('SELECT COUNT(*) FROM members')
            total_members = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM members WHERE status = 'active'")
            active_members = cur.fetchone()[0]
            
            cur.execute('''
                SELECT COUNT(*) FROM events 
                WHERE event_date >= date_trunc('month', CURRENT_DATE)
                AND event_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
            ''')
            events_this_month = cur.fetchone()[0]
            
            cur.execute('''
                SELECT 
                    ROUND(
                        (COUNT(CASE WHEN er.status = 'attended' THEN 1 END)::numeric / 
                        NULLIF(COUNT(*), 0)) * 100
                    )
                FROM event_registrations er
            ''')
            attendance = cur.fetchone()[0] or 0
            
            result = {
                'totalMembers': total_members,
                'activeMembers': active_members,
                'eventsThisMonth': events_this_month,
                'attendance': int(attendance)
            }
        
        else:
            result = {'error': 'Unknown resource'}
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result)
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