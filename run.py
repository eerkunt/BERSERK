from gevent import monkey
monkey.patch_all()

from app import app, ws

ws.run(app, host='127.0.0.1', port=5000, debug=True)