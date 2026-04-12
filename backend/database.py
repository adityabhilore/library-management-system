import mysql.connector
import os
from urllib.parse import urlparse

def get_db_connection():
    print("\n🔌 Connecting to MySQL...")
    try:
        # Check for DATABASE_URL (Railway format) first
        database_url = os.getenv("DATABASE_URL")
        
        if database_url:
            # Parse Railway connection string
            # Format: mysql://user:password@host:port/database
            parsed = urlparse(database_url)
            db_host = parsed.hostname
            db_user = parsed.username
            db_password = parsed.password
            db_port = parsed.port or 3306
            db_name = parsed.path.lstrip('/')
            print(f"✅ Using DATABASE_URL: {db_host}:{db_port}/{db_name}")
        else:
            # Fallback to individual environment variables
            db_host = os.getenv("DB_HOST", "127.0.0.1")
            db_user = os.getenv("DB_USER", "root")
            db_password = os.getenv("DB_PASSWORD", "Aditya@2004")
            db_name = os.getenv("DB_NAME", "library_access")
            db_port = int(os.getenv("DB_PORT", "3306"))
            print(f"✅ Using env vars: {db_host}:{db_port}/{db_name}")
        
        conn = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name,
            port=db_port,
            connection_timeout=10,
            auth_plugin="mysql_native_password",
            use_pure=True
        )
        print(f"✅ MySQL Connected Successfully to {db_host}:{db_port}/{db_name}")
        return conn
    except mysql.connector.Error as e:
        print(f"❌ MySQL Connection Error: {str(e)}")
        raise Exception(f"Failed to connect to database: {str(e)}")



