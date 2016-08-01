	/*
	BERSERK :: A Load Generator
	---------------------------
	A simple load generator with a web based interface written in
	Python with Flask and React.

*/

/*
  Notification Class :
  This class is used for giving messages to the user.
*/
var Notification = React.createClass({
	render: function() {
		var classes = "alert alert-" + this.props.newState.alertClass;
		return (
			<div id="notification" className={ classes }>{ this.props.newState.msg }</div>
		);
	}
});

/*
  Target Class :
  This is the INPUT area that is responsible of registering new target.
*/
var Target = React.createClass({
	click: function() {
		var theVal = this.refs.target.value;
		this.props.onClick(theVal);
	},
	render: function() {
		return (
			<div className="col-md-6">
		        <div className="row">
					<div className='input-group'>
						<span className="input-group-btn">
					  		<button type="button" className="btn btn-secondary glyphicon glyphicon-off" onClick={ this.click } />
					  	</span>
					  	<input 	ref="target" type="text" 
					  			onSubmit={ this.setTarget }
					  			value= { this.props.target }
					  			placeholder="Target URL" 
					  			className="form-control" />

					</div>
		        </div>
		    </div>
      	);
	}
})

/*
  HeaderFrame Class :
  This is the branding part of the code. Just the name of application and some motto. Basic header.
*/
var HeaderFrame	= React.createClass({
	render: function() {
		var myStyle = { color: "gray" };
		if ( this.props.connected )
		    myStyle = { color: "red" };
		return (
			<div className="col-md-6">
                    <h4>
                        <span className="glyphicon glyphicon-fire" style={ myStyle }> </span> <strong> { this.props.conf.name }</strong>
                        <br />
                        <small>Load Generator</small>
                    </h4>
            </div>
		);
	}
});


/*
  HistoryHeader Class :
  This is defining the table head and column description for Attack History table.
*/
var HistoryHeader = React.createClass({
	render: function() {
		return (
			<thead key='tableHeader'>
	            <tr>
	                <th>
	                    Time
	                </th>
	                <th>
	                    URL
	                </th>
	                <th>
	                    Concurrency
	                </th>
	                <th>
	                    Status
	                </th>
	            </tr>
	        </thead>
		)
	}
})

var HistoryGlyph = React.createClass({
	getInitialState: function() {
	    return {
	    	classStyle: this.props.classStyle,
	    	classColor: this.props.classColor
	    };
	},
	handleClick: function() {
		if (confirm('Are you sure to delete this record ?')) {
			console.log('Deleting '+this.props.uuid);
			var that = this;
			$.ajax({
				type: 'DELETE',
				url: '/attack/'+this.props.uuid+'/'+this.props.status,
				success: function( data ) {
					console.log('Deleted '+data);
					that.setState({ classStyle: 'glyphicon glyphicon-trash'});
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					console.log('ERROR: Can not delete data for '+that.props.uuid+'. '+errorThrown);
				}
			});
		} else {
			console.log('Skipped deleting.');
		}
	},
	render: function() {
		return (
			<span className={ this.state.classStyle } style={ this.state.classColor } onClick={ this.handleClick }></span>
		)

	}
})
/*
  HistoryRow Class :
  Just like HistoryHeader, this class fills up the Attack History Table with historic data.
*/
var HistoryRow = React.createClass({
	render: function() {

		var attackColor = '';
		var attackGlyph = 'glyphicon glyphicon-';
		var glyphColor = {};

		switch ( this.props.status ) {
			case "pending": attackColor = "warning"; attackGlyph +=  'time'; glyphColor = { color: 'gray' }; break;
			case "error": attackColor = "danger"; attackGlyph +=  'warning-sign'; glyphColor = { color: 'darkred' }; break;
			case "running": attackColor = "success"; attackGlyph +=  'dashboard'; glyphColor = { color: 'red' }; break;
			case "finished": attackColor = "info"; attackGlyph +=  'ok'; glyphColor = { color: 'green' }; break;
		};

		return (
			<tr key={ this.props.uuid } className={ attackColor } onClick={ this.props.onClick } >
				<td>{this.props.time_start}</td>
				<td>{this.props.URL}</td>
				<td>{this.props.concurrency}</td>
				<td>
					<HistoryGlyph 
						classStyle={ attackGlyph } 
						classColor={ glyphColor } 
						uuid={ this.props.uuid }
						status={ this.props.status }
					/>
				</td>
			</tr>
		);
	}
});

/*
  History Class :
  Parent class for HistoryRow and HistoryHeader classes
*/
var History = React.createClass({
	render: function() {
		return (
			<table className="table table-hover">
				<HistoryHeader/>
		        <tbody key='tableBody'>
		        { this.props.targetList }
		        </tbody>
	        </table>
		)
	}
})

/*
  TargetDetails Class :
  This class shows an area of selected target, giving up realtime data.
  Not sure how it will be realtime, but we will find a way out eventually.
*/
var RealtimeTargetDetails = React.createClass({
	render: function() {
			/*
			socket.on('response', function(msg) {
				console.log('WS Received: '+msg.data);
			});
			*/
			return (
				<div className="col-md-12">
					<p>{ this.props.targetName }</p>
	    			<ul className="nav nav-pills" id='currentAttackResults'>
	            		{ targetResponses }
	    			</ul>
				</div>
			)
	}
});

var TargetDetails = React.createClass({
	render: function() {
		var iconName = "fa fa-tachometer";
		return (
			<div className="col-md-12">
				<p><i className={ this.props.targetName ? iconName : null }> <span className='targetName'>{ this.props.targetName }</span></i></p>
    			<div>
            		{ this.props.target }
            	</div>
			</div>
		)
	}
});

var TargetBadge = React.createClass({
	render: function() {
		var color = 'fa fa-' + this.props.color + ' fa-2x';
		return ( 
            <a className="quick-btn" href="#">
                <i className={ color }></i><br/>
                <span>{ this.props.responseCode }</span>
                <span className="label label-success">{ this.props.count }</span>
            </a>
		);
	}
});

/*
  Main Class :
  One ring to rule them all. This is the class that is managing the whole logic for our single page application.
*/
var Main = React.createClass({
	handleClick: function( uuid, URL ) {
		console.log('Clicked on the column for '+uuid);
		var that = this;
		var response = [];
		$.ajax({
			type: 'GET',
			url: '/target/'+uuid,
			success: function( data ) {
				console.log('Success :'+data);
				var targetResponses = [];
				$.each(data, function(index, response) {
				console.log('INDEX: '+index+'  RESPONSE: '+response);
				var icon = 'genderless';
				switch( index ) {
					case '200': icon = 'thumbs-o-up'; break;
					case '302': icon = 'hand-o-right'; break;
					case '403': icon = 'hand-paper-o'; break;
					case '404': icon = 'thumbs-o-down'; break;
					case '500': icon = 'hand-spock-o'; break;
					case '503': icon = 'hand-lizard-o'; break;
				}
				targetResponses.push(
							<TargetBadge key={index} 
										 color={ icon }
										 responseCode={index}
										 count={ response } />
							);
				});
				that.setState({ selectedTarget: targetResponses, target: URL });
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log('ERROR: Can not fetch data for '+this.props.target+'. '+errorThrown);
			}
		});

		/*
		if ( this.state.selectedTarget != uuid ) {
			this.setState({ selectedTarget: uuid });
		}
		*/
	},
	getInitialState: function() {
	    return {
	    	notification: {
	    		alertClass: 'info',
	    		msg: 'Ready to attack.'
	    	},
	    	target: '',
	    	selectedTarget: '',
	    	targetList: this.fetchGetData('/target/all'),
	    	targetURL: '',
	    	connected: false,
	    };
	},
	setTarget: function( theVal ) {
		var validURL = new RegExp(/^(?:(?:(?:https?|ftp):)?\/\/)[0-9:]*(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i).test( theVal );

		if ( validURL ) {
			console.log('=> Setting up target as '+theVal);
			this.setState({ target: theVal, selectedTarget: theVal });
			var notifyArray = {
				alertClass: 'success',
				msg: 'Registering a new attack on '+ theVal
			};
			this.setState({ notification: notifyArray });
			this.registerNewTarget( theVal, 20 );
		} else {
			console.log('=> Invalid URL');
			var notifyArray = {
				alertClass: 'danger',
				msg: 'Invalid URL!'
			};
			this.setState({ notification: notifyArray });
		}
	},
	fetchGetData: function( URL ) {
		console.log('Fetching '+URL);
		var that = this;
		var response = [];
		$.ajax({
			type: 'GET',
			url: URL,
			success: function( data ) {
				that.setState({ targetList: data });
				return data;
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				that.setState({ notification: {
	        		alertClass: 'danger',
	        		msg: 'ERROR: Could not fetch attack history.'
    			}});	
			}
		});
	},
	registerNewTarget: function(URL, concurrency) {
		var that = this;
		var targetList;
		$.ajax({
	        type: 'POST',
	        url: '/attack',
	        data: { 'target': URL },
	        success: function( data ) {
	        	that.setState({ notification: {
	        							alertClass: 'success',
	        							msg: 'Initiating a new attack on '+URL+' with '+concurrency+' concurrency ('+data.uuid+')'
    							},
    							target: URL,
    							selectedTarget: data.uuid
    						});
	        	that.fetchGetData('/target/all');
	        	that.handleClick( data.uuid, URL);
	        },
	        error: function(XMLHttpRequest, textStatus, errorThrown) {
	        	that.setState({ notification: {
	        							alertClass: 'danger',
	        							msg: 'ERROR: Could not connect to internal server to initiate an attack. ('+errorThrown+')'
    							}});	
	        }
	    });
	},
	componentDidMount: function() {
	    var url = 'http://' + document.domain + ':' + location.port;
	    var socket = io.connect(url + '/realtime');
	    var _self = this;

        // Handles main connectivity
	    socket.on('connected', function() { _self.setStateAsConnected() });
	    socket.on('error', function( err ) { _self.setStateAsDisconnected( err ) });

	},
	setStateAsConnected: function() { console.log('WS Connection established.'); this.setState({ 'connected': true }); },
	setStateAsDisconnected: function( err ) { console.log('WS Connection broken. ERROR: ' + err); this.setState({ 'connected': false }); },
	render: function() {
		
		var historyRow = [];
		var that = this;
		$.each(this.state.targetList, function(index, response) {
			var boundClick = that.handleClick.bind(that, response.uuid, response.URL);
			historyRow.push(
						<HistoryRow key={response.uuid} uuid={ response.uuid } 
									time_start={ response.time_start }
									time_end={ response.time_end }
									URL={ response.URL }
									concurrency={ response.concurrency }
									status={ response.status }
									onClick={ boundClick } />
						);
		});

		return (
				<div className="row">
		            <div className="col-md-12">
		                <div className="row">
		                    <HeaderFrame conf={ this.props.conf } connected={ this.state.connected }/>
		                    <Target value={ this.state.target } onClick={this.setTarget}/>
		                </div>
		                <Notification newState={ this.state.notification }/>
		                <TargetDetails targetName={ this.state.target } target={ this.state.selectedTarget }/>
		            </div>
		            <History targetList={ historyRow } />
		        </div>

		);
	}
});

// For notification area
ReactDOM.render(<Main conf={ { "name": "BERSERK" } } />, document.getElementById("mainScreen"));
				