from pymongo import MongoClient

try:
    client = MongoClient('localhost', 27017, serverSelectionTimeoutMS=5000)
    print("Conectando...")
    print(client.server_info())
    print("Conexión exitosa!")
except Exception as e:
    print(f" Error: {e}")