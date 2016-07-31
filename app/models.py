from app import db
import datetime


class Target(db.Model):

	uuid = db.Column(db.String(32), primary_key=True)
	URL = db.Column(db.String(255), index=True)
	concurrency = db.Column(db.SmallInteger())
	status = db.Column(db.String(30), index=True)
	time_start = db.Column(db.DateTime(), index=True, default=datetime.datetime.utcnow)
	time_end = db.Column(db.DateTime(), index=True)
	resulss = db.relationship('Result', backref='target', lazy='dynamic')

	def __repr__(self):
		return '<Target %r>' % self.URL


class Result(db.Model):

	id = db.Column(db.Integer(), primary_key=True)
	uuid = db.Column(db.String(36), db.ForeignKey('target.uuid'))
	code = db.Column(db.SmallInteger(), index=True)
	count = db.Column(db.Integer())

	def __repr__(self):
		return '<Result Target UUID %r>' % self.uuid
