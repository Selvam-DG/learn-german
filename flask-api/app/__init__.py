from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt
from .api import register_blueprints

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    
    db.init_app(app)
    jwt.init_app(app)
    
    register_blueprints(app)
    
    return app