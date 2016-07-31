from gevent import monkey
monkey.patch_all()

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
ws = SocketIO(app)

from app import views, models
