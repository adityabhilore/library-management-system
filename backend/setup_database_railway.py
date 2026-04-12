"""
Database setup script for Railway - creates all necessary tables
Run with: python setup_database_railway.py
"""

import mysql.connector
from utils import hash_password

# Your Railway MySQL connection details
RAILWAY_CONFIG = {
    "host": "maglev.proxy.rlwy.net",
    "user": "root",
    "password": "uoKrnioDPpWvITgyVgOrKMqDNViSfAFY",
    "database": "railway",
    "port": 55763
}

def setup_railway_database():
    print("🔧 Starting Railway database setup...\n")
    
    try:
        conn = mysql.connector.connect(**RAILWAY_CONFIG)
        print(f"✅ Connected to Railway MySQL: {RAILWAY_CONFIG['host']}:{RAILWAY_CONFIG['port']}/{RAILWAY_CONFIG['database']}")
        
    except Exception as e:
        print(f"❌ Could not connect to Railway database: {str(e)}")
        return

    cursor = conn.cursor()

    try:
        # Create admin table
        print("📝 Creating 'admin' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ admin table created")

        # Create members table
        print("📝 Creating 'members' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS members (
                member_id INT AUTO_INCREMENT PRIMARY KEY,
                roll_no VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL,
                department VARCHAR(100),
                year VARCHAR(10),
                division VARCHAR(10),
                phone VARCHAR(20),
                email VARCHAR(100),
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ members table created")

        # Create logs table
        print("📝 Creating 'logs' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS logs (
                log_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100),
                role VARCHAR(20),
                department VARCHAR(100),
                action VARCHAR(50) NOT NULL,
                scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'normal',
                matched_subject VARCHAR(100),
                FOREIGN KEY (user_id) REFERENCES members(member_id) ON DELETE CASCADE
            )
        """)
        print("✅ logs table created")

        # Create timetable table
        print("📝 Creating 'timetable' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS timetable (
                timetable_id INT AUTO_INCREMENT PRIMARY KEY,
                day VARCHAR(20) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                subject VARCHAR(100) NOT NULL,
                division VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ timetable table created")

        # Create academic_calendar table
        print("📝 Creating 'academic_calendar' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS academic_calendar (
                event_id INT AUTO_INCREMENT PRIMARY KEY,
                event_name VARCHAR(100) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ academic_calendar table created")

        # Check if admin user exists
        cursor.execute("SELECT COUNT(*) as count FROM admin")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("\n📝 Creating default admin user...")
            # Create default admin user with password "admin123"
            admin_password = hash_password("admin123")
            cursor.execute("""
                INSERT INTO admin (username, password_hash, role)
                VALUES (%s, %s, %s)
            """, ("admin", admin_password, "admin"))
            print("✅ Default admin user created")
            print("   Username: admin")
            print("   Password: admin123")
        else:
            print(f"\n✅ Admin user already exists ({count} user(s))")
            cursor.execute("SELECT username FROM admin")
            for admin in cursor.fetchall():
                print(f"   - {admin[0]}")

        conn.commit()
        conn.close()
        
        print("\n✅ Railway database setup completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during setup: {str(e)}")
        conn.rollback()
        conn.close()

if __name__ == "__main__":
    setup_railway_database()
