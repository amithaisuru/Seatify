from urllib.parse import quote_plus
from dotenv import load_dotenv
import os

load_dotenv()
class Config:

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = quote_plus(os.getenv('DB_PASSWORD')) 
    DB_HOST = os.getenv('DB_HOST')
    DB_NAME = os.getenv('DB_NAME')
    SQLALCHEMY_DATABASE_URI = f'mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))