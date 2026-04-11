import mysql.connector
import os

def get_db_connection():
    print("\n🔌 Connecting to MySQL...")
    try:
        # Support environment variables for cloud deployment
        db_host = os.getenv("DB_HOST", "127.0.0.1")
        db_user = os.getenv("DB_USER", "root")
        db_password = os.getenv("DB_PASSWORD", "Aditya@2004")
        db_name = os.getenv("DB_NAME", "library_access")
        
        conn = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name,
            connection_timeout=5,
            auth_plugin="mysql_native_password",
            use_pure=True
        )
        print("✅ MySQL Connected Successfully")
        return conn
    except mysql.connector.Error as e:
        print("⚠️  MySQL Connection Warning:", str(e)[:100])
        print("💡 Running in demo mode - database unavailable")
        return None



