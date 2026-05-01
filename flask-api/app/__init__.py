from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt, migrate
from .api import register_blueprints
from .models import Vocab, Story
from datetime import timedelta
import os
from dotenv import load_dotenv
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    
    db.init_app(app)
    migrate.init_app(app,db)
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 15))
    )

    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 7))
    )
    jwt.init_app(app)
    
    register_blueprints(app)
    
    return app