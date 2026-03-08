from .health import bp as health_bp
from .daily_vocab import bp as daily_vocab_bp
from .admin.auth import bp as auth_bp
from .admin.routes import bp as admin_bp
from .vocab import vocab_bp

def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(daily_vocab_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(vocab_bp)