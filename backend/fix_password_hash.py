"""
Fix admin password hash - bcrypt has a 72-byte limit on input
"""

import mysql.connector
from passlib.context import CryptContext

# Setup password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

RAILWAY_CONFIG = {
    "host": "maglev.proxy.rlwy.net",
    "user": "root",
    "password": "uoKrnioDPpWvITgyVgOrKMqDNViSfAFY",
    "database": "railway",
    "port": 55763
}

def fix_admin_password():
    print("🔧 Fixing admin password hash...\n")
    
    try:
        conn = mysql.connector.connect(**RAILWAY_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Get current admin
        cursor.execute("SELECT admin_id, username, password_hash FROM admin WHERE username='admin'")
        admin = cursor.fetchone()
        
        if not admin:
            print("❌ Admin user not found")
            conn.close()
            return
        
        print(f"📋 Current admin: {admin['username']}")
        print(f"📋 Current hash length: {len(admin['password_hash'])} chars")
        print(f"📋 Current hash: {admin['password_hash'][:50]}...")
        
        # Create new hash with password "admin123"
        new_password = "admin123"
        new_hash = pwd_context.hash(new_password)
        
        print(f"\n🔑 New hash length: {len(new_hash)} chars")
        print(f"🔑 New hash: {new_hash[:50]}...")
        
        # Update the database
        cursor.execute(
            "UPDATE admin SET password_hash=%s WHERE admin_id=%s",
            (new_hash, admin["admin_id"])
        )
        conn.commit()
        
        print(f"\n✅ Admin password fixed successfully!")
        print(f"   Username: admin")
        print(f"   Password: {new_password}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    fix_admin_password()
