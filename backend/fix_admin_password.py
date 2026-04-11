"""
One-time script to fix the admin password hash in the database.
Run this once:  python fix_admin_password.py
Then delete this file.
"""

from database import get_db_connection
from utils import hash_password

# ⚠️ Change this to whatever admin password you want
NEW_ADMIN_PASSWORD = "admin123"

def fix_admin_password():
    conn = get_db_connection()
    if conn is None:
        print("❌ Could not connect to the database.")
        return

    cursor = conn.cursor(dictionary=True)

    # Check current state
    cursor.execute("SELECT admin_id, username, password_hash FROM admin LIMIT 1")
    admin = cursor.fetchone()

    if not admin:
        print("❌ No admin found in the database.")
        conn.close()
        return

    print(f"📋 Current admin: {admin['username']}")
    print(f"📋 Current hash:  {admin['password_hash']}")

    # Generate a proper bcrypt hash
    new_hash = hash_password(NEW_ADMIN_PASSWORD)
    print(f"\n🔑 New bcrypt hash: {new_hash}")

    # Update the database
    cursor.execute(
        "UPDATE admin SET password_hash=%s WHERE admin_id=%s",
        (new_hash, admin["admin_id"])
    )
    conn.commit()
    conn.close()

    print(f"\n✅ Admin password updated successfully!")
    print(f"   Username: {admin['username']}")
    print(f"   Password: {NEW_ADMIN_PASSWORD}")

if __name__ == "__main__":
    fix_admin_password()
