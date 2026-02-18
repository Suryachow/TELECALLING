from pymongo import MongoClient
from django.conf import settings

_client = None

def get_mongo_client():
    global _client
    if _client is None:
        _client = MongoClient(
            settings.MONGO_URI,
            maxPoolSize=settings.MONGO_MAX_POOL,
            serverSelectionTimeoutMS=settings.MONGO_SERVER_SELECTION_TIMEOUT_MS,
            socketTimeoutMS=settings.MONGO_SOCKET_TIMEOUT_MS,
            maxIdleTimeMS=settings.MONGO_MAX_IDLE_MS,
        )
    return _client

def get_database(db_name):
    client = get_mongo_client()
    return client[db_name]

def close_client():
    global _client
    if _client:
        _client.close()
        _client = None
