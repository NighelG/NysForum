from pymongo import MongoClient
from django.conf import settings
import gridfs
from bson import ObjectId, errors
import traceback

class MongoDBService:
    _instance = None
    _client = None
    _db = None
    _fs = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def __init__(self):
        if self._client is None:
            try:
                config = settings.MONGODB_CONFIG
                print(f"Conectando a MongoDB: {config['host']}:{config['port']}, DB: {config['database']}")
                self._client = MongoClient(
                    host=config['host'],
                    port=config['port'],
                    serverSelectionTimeoutMS=5000
                )
                self._client.admin.command('ismaster')
                print("Conexión a MongoDB establecida correctamente")
                self._db = self._client[config['database']]
                self._fs = gridfs.GridFS(self._db)
                print("GridFS inicializado correctamente")
                print("Ejecutando prueba de conexión...")
                self.test_connection()
            except Exception as e:
                print(f"Error conectando a MongoDB: {e}")
                raise
    def test_connection(self):
        try:
            dbs = self._client.list_database_names()
            print(f" Bases de datos disponibles: {dbs}")
            if self._db.name in dbs:
                print(f" Base de datos '{self._db.name}' existe")
                collections = self._db.list_collection_names()
                print(f" Colecciones en '{self._db.name}': {collections}")
                if 'fs.files' in collections:
                    print(" Colección 'fs.files' existe")
                else:
                    print(" Colección 'fs.files' NO existe")
                    
                if 'fs.chunks' in collections:
                    print(" Colección 'fs.chunks' existe")
                else:
                    print(" Colección 'fs.chunks' NO existe")
            else:
                print(f" Base de datos '{self._db.name}' NO existe")
            return True
        except Exception as e:
            print(f" Error en test_connection: {e}")
            return False
    def save_file(self, file, metadata=None):
        try:
            print(f" Guardando archivo en GridFS. Tipo: {type(file)}, Metadata: {metadata}")
            if hasattr(file, 'seek'):
                file.seek(0)
            file_content = file.read()
            print(f" Tamaño del archivo: {len(file_content)} bytes")
            file_id = self._fs.put(
                file_content,
                filename=getattr(file, "name", "upload.bin"),
                content_type=getattr(file, "content_type", "application/octet-stream"),
                metadata=metadata or {},
            )
            print(f" Archivo guardado en GridFS con ID: {file_id}")
            return str(file_id)
        except Exception as e:
            print(f" Error en save_file: {e}")
            print(f" Traceback: {traceback.format_exc()}")
            return None
    def get_file(self, file_id):
        try:
            print(f" Buscando archivo en GridFS: {file_id}")
            oid = ObjectId(file_id)
            file_obj = self._fs.get(oid)
            print(f" Archivo encontrado: {file_obj.filename}")
            return file_obj
        except (errors.InvalidId, gridfs.NoFile) as e:
            print(f" Error en get_file: {e}")
            return None
        except Exception as e:
            print(f" Error inesperado en get_file: {e}")
            return None
    def delete_file(self, file_id):
        try:
            print(f" Eliminando archivo de GridFS: {file_id}")
            oid = ObjectId(file_id)
            self._fs.delete(oid)
            print(f" Archivo eliminado: {file_id}")
            return True
        except (errors.InvalidId, gridfs.NoFile) as e:
            print(f" Error en delete_file: {e}")
            return False
    def save_image(self, image_file, metadata=None):
        print(f" Guardando imagen en GridFS")
        image_metadata = {
            'type': 'avatar',
            'uploaded_by': metadata.get('user_id') if metadata else None,
            'username': metadata.get('username') if metadata else None,
            **(metadata or {})
        }
        return self.save_file(image_file, image_metadata)
    def get_image(self, file_id):
        return self.get_file(file_id)
    def delete_image(self, file_id):
        return self.delete_file(file_id)
    def update_metadata(self, file_id, new_metadata: dict):
        try:
            oid = ObjectId(file_id)
            file_obj = self._fs.get(oid)
            new_data = {
                "filename": file_obj.filename,
                "content_type": file_obj.content_type,
                "metadata": {**file_obj.metadata, **new_metadata},
            }
            new_file_id = self._fs.put(
                file_obj.read(),
                **new_data
            )
            self._fs.delete(oid)
            return str(new_file_id)
        except (errors.InvalidId, gridfs.NoFile):
            return None
    def list_files(self):
        try:
            files = list(self._db.fs.files.find())
            print(f" Archivos en GridFS: {len(files)}")
            for file in files:
                print(f"  - {file['_id']}: {file.get('filename', 'sin nombre')} "
                        f"({file.get('content_type', 'sin tipo')})")
            return files
        except Exception as e:
            print(f" Error listando archivos: {e}")
            return []
mongo_service = MongoDBService()