"""
Database setup script - creates all necessary tables
Run this once to initialize the database:  python setup_database.py
"""

from database import get_db_connection
from utils import hash_password

def setup_database():
    print("🔧 Starting database setup...\n")
    
    conn = get_db_connection()
    if conn is None:
        print("❌ Could not connect to the database.")
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
                action VARCHAR(50) NOT NULL,
                scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'normal',
                matched_subject VARCHAR(100),
                FOREIGN KEY (user_id) REFERENCES members(member_id)
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
            print("\n✅ Admin user already exists")

        conn.commit()
        conn.close()
        
        print("\n✅ Database setup completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during setup: {str(e)}")
        conn.rollback()
        conn.close()

if __name__ == "__main__":
    setup_database()
