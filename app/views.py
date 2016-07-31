from flask import render_template, jsonify, request
from app import app, db, models, ws
from .attacker import initiate_attack
from sqlalchemy import desc
import uuid

conf = { 'name':'BERSERK',
         'description':'A Multi-threaded HTTP Load Generator',
         'version':'0.1',
		 'author':'Emre Erkunt'}

@app.route('/')
@app.route('/index')
def index():
	global conf
	
	return render_template('react.html', conf = conf)

@app.route('/attack', methods=['POST'])
def attack():

	# Register Attack
	attack_id = uuid.uuid1(clock_seq=True)
	data = models.Target(
		uuid=str(attack_id),
		URL=request.form['target'],
		concurrency=20,
		status='pending'
	)
	db.session.add(data)
	db.session.commit()

	return jsonify({
		'state': 'pending',
		'uuid': initiate_attack( str(attack_id) )
	})

@app.route('/attack/<string:uuid>/<string:status>', methods=['DELETE'])
def delete(uuid, status):
	response = db.session.query(models.Target).filter(models.Target.uuid == uuid).filter(models.Target.status == status).delete()
	if response > 0:
		db.session.commit()
		return 'OK'
	else:
		return 'Not Found'

@app.route('/target/all')
def all():
	targets = models.Target.query.order_by(desc(models.Target.time_start))
	response = list()
	for t in targets:
		response.append({
			'uuid': t.uuid,
			'time_start': t.time_start,
			'time_end': t.time_end,
			'URL': t.URL,
			'concurrency': t.concurrency,
			'status': t.status
			})
	return jsonify(response)

@app.route('/target/<string:uuid>')
def target( uuid ):
	# Get the data from DB.
	response = {
			'200': 0,
			'404': 0,
			'500': 0,
			'403': 0,
			'302': 0,
			'Timeout': 0
	}
	for result in db.session.query(models.Result).filter(models.Result.uuid == uuid):
		if str(result.code) in response:
			response[str(result.code)] = result.count

	if len(response) == 0:
		return jsonify({
					'200': 15,
					'404': 22,
					'500': 1,
					'403': 20,
					'302': 0,
					'Timeout': 0,
			})
	else:
		return jsonify(response)


''' SocketIO Implementation.
	This will cover the area for realtime monitoring.

	Hopefully..

@socketio.on('broadcast', namespace='/realtime')
def socket_broadcast( message ):
	emit('response', { 'data': message['data']}, broadcast=True)

@socketio.on('event', namespace='/realtime')
def socket_event( message ):
	emit('response', { 'data': message['data'] })
'''

@ws.on('connect', namespace='/realtime')
def ws_connect():
	ws.emit('connected', { "Connected": 1 }, namespace='/realtime')

@ws.on('disconnect', namespace='/realtime')
def ws_connect():
	print 'Client disconnected.'

@ws.on_error('/realtime')
def ws_error_handler(e):
	print 'WS Error : ' + e


