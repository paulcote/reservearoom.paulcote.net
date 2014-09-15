var scopes = 'https://www.googleapis.com/auth/calendar';
var calendarId = null;
var currentEvent = null;

function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth,1);
  checkAuth();
}

function checkAuth() {
  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true},
      handleAuthResult);
}

function handleAuthResult(authResult) {
  if (!authResult.error) {
  	getCalendars();
  } else {
   }
}

function authorize() {
  gapi.auth.authorize(
      {client_id: clientId, scope: scopes, immediate: false},
      handleAuthResult);
  return false;
}

function getCalendars(){
	gapi.client.load('calendar', 'v3', function() {
		var request = gapi.client.calendar.calendarList.list();
		request.execute(function(resp) {
			calendarList = '';
				
			for (key in resp.items) {
			    // "Good enough" for most cases
			    if (String(parseInt(key, 10)) === key && resp.items.hasOwnProperty(key)) {
			        calendarList += '<li><button data-calendar-id="'+resp.items[key].id+'">'+resp.items[key].summary.replace(/<(?:.|\n)*?>/gm, '').substring(0, 20)+(resp.items[key].summary.replace(/<(?:.|\n)*?>/gm, '').length > 20?'...':'')+'</button></li>'
			    }
			}
			
			$('.calendar-select ul').html(calendarList);
			$('.connect').removeClass('active');
			$('.calendar-select').addClass('active');
		});
	});
}

function selectCalendar(calId){
	calendarId = calId;
	
	gapi.client.load('calendar', 'v3', function() {
		var request = gapi.client.calendar.calendars.get({calendarId: calendarId});
		
		request.execute(function(resp) {
			$('.room-name').html(resp.summary);
			updateCalendar(true);
		});
	});
}

function updateCalendar(onetime){
	if(calendarId){
		gapi.client.load('calendar', 'v3', function() {
			var now = new Date();
			var request = gapi.client.calendar.events.list({calendarId: calendarId, orderBy: 'startTime', singleEvents: true, timeMin: now.toISOString(), timeMax: moment().add('days',14).toDate().toISOString()});
			
			request.execute(function(resp) {
				console.log(resp);
				currentEvent = null;
				var nextEvents = [];
				
				for (key in resp.items) {
				    // "Good enough" for most cases
				    if (String(parseInt(key, 10)) === key && resp.items.hasOwnProperty(key)) {
				    	var event = resp.items[key];
				    	var start = new Date(event.start.dateTime);
				    	var end = new Date(event.end.dateTime);
				    	var currentDate = new Date();
				    	
				    	var eventObject = {
				    		id : event.id,
				    		sequence: event.sequence,
				    		title : event.summary,
				    		startDate : start,
				    		endDate : end
				    	}
				    	
				    	if((currentDate >= start && currentDate <= end) || !moment(start).isValid()){
				    		currentEvent = eventObject;
				    	}
				    	else{
				    		nextEvents.push(eventObject);
				    	}
				    }
				}
				
				if(currentEvent){
					var eventDetails = '<h2 class="event-name">'+currentEvent.title+'</h2>';
					if(moment(currentEvent.startDate).isValid()){
						eventDetails += '<p class="event-time">'+moment(currentEvent.startDate).format('H[h]mm')+' à '+moment(currentEvent.endDate).format('H[h]mm')+'</p>';
					}
					$('.event-details').html(eventDetails);
					$('.room-status-title').text('Occupée');
					$('.room-status').removeClass('free').addClass('busy');
					$('.change-status').text('Rendre libre');
				}
				else{
					$('.room-status').removeClass('busy').addClass('free');
					$('.room-status-title').text('Libre');
					$('.change-status').text('Rendre occupée');
				}
				
				var currentDay = '';
				var nextOutput = '';
				for(i = 0, l = nextEvents.length; i<l; i++){
					var event = nextEvents[i];
					var day = moment(event.startDate).format('dddd D MMMM');
					if(day != currentDay){
						var dayParts = day.split(' ');
						currentDay = day;
						
						if(nextOutput != '')
							nextOutput += '</dl>';
						
						nextOutput += '<h3 class="day">';
							nextOutput += '<span class="day-name">'+dayParts[0]+' </span>';
							nextOutput += '<span class="date">'+dayParts[1]+' </span>';
							nextOutput += '<span class="month">'+dayParts[2]+'</span>';
						nextOutput += '</h3><dl class="events">';
					}
					nextOutput += '<dt class="event-time">'+moment(event.startDate).format('H[h]mm')+' à '+moment(event.endDate).format('H[h]mm')+'</dt>';
					nextOutput += '<dd class="event-title">'+event.title+'</dd>';
				}
				$('.next-events').html(nextOutput);
			});
		});
	}
	if(!onetime)
		setTimeout(updateCalendar, 1000*60);
}

function startEvent(){
	gapi.client.load('calendar', 'v3', function() {
		var now = new Date();
		var body = {
			'summary' : 'Recontre ponctuelle',
			'start' : {
				'date' : moment().format('YYYY-MM-DD')
			},
			'end' : {
				'date' : moment().format('YYYY-MM-DD')
			},
			'sequence' : 0
		};
		var request = gapi.client.calendar.events.insert({calendarId: calendarId, resource: body});
		
		request.execute(function(resp) {
			currentEvent = {
				'title' : 'Recontre ponctuelle',
				'id' : resp.id,
				'sequence' : 0,
				'startDate' : null
			};
		});
	});
}

function checkEvent(){
  gapi.client.load('calendar', 'v3', function() {
    var request = gapi.client.calendar.events.list({calendarId: calendarId, orderBy: 'startTime', singleEvents: true, timeMin: now.toISOString(), timeMax: moment().add('days',14).toDate().toISOString()});
    
    request.execute(function(resp) {
        createEvent();
    });
  });
}

function createEvent(){  
	gapi.client.load('calendar', 'v3', function() {
		var now = new Date();
		var body = {
			'summary' : $('input[name=reason]').val(),
			'start' : {
				'dateTime' : $('input[name=date_submit]').val()+'T'+$('input[name=start_submit]').val()+':00',
				'timeZone' : 'America/Montreal'
			},
			'end' : {
				'dateTime' : $('input[name=date_submit]').val()+'T'+$('input[name=end_submit]').val()+':00',
				'timeZone' : 'America/Montreal'
			},
			'sequence' : 0
		};
		var request = gapi.client.calendar.events.insert({calendarId: calendarId, resource: body});
		
		request.execute(function(resp) {
        console.log(resp);
  			$('.viewport').removeClass('show-book-room');
  			$('button.book-room').removeClass('cancel');
  			$('button.book-room').text('Faire une réservation');
  			updateCalendar(true);
		});
	});
}

function endEvent(){
	if(currentEvent.startDate != null && moment(currentEvent.startDate).isValid()){
		gapi.client.load('calendar', 'v3', function() {
			var now = new Date();
			var body = {
				'start' : {
					'dateTime' : currentEvent.startDate.toISOString()
				},
				'end' : {
					'dateTime' : now.toISOString()
				},
				'sequence' : currentEvent.sequence + 1
			};
			var request = gapi.client.calendar.events.update({calendarId: calendarId, eventId: currentEvent.id, resource: body});
			
			request.execute(function(resp) {
				console.log(resp);
			});
		});
		
	}
	else{
		gapi.client.load('calendar', 'v3', function() {
			var request = gapi.client.calendar.events.delete({calendarId: calendarId, eventId: currentEvent.id});
			
			request.execute(function(resp) {
				
			});
		});
	}
}