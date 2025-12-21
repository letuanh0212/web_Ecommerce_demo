import pyodbc

def get_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost;"
        "DATABASE=Ecommerce;"
        "UID=sa;"
        "PWD=123456;"
        "TrustServerCertificate=yes;"
    )


