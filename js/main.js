$(function() {
	$.extend($.fn.pickadate.defaults, {
	    monthsFull: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
	    weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
	    today: 'aujourd\'hui',
	    clear: 'effacer',
	    format: 'd mmmm yyyy',
	    formatSubmit: 'yyyy-mm-dd',
	    firstDay: false
	});

	$('.datepicker').pickadate();
	$('.timepicker').pickatime({format: 'H!hi',formatSubmit: 'HH:i', interval: 15});
	
	$('button.change-status').click(function(){
		if($('.room-status').hasClass('free')){
			startEvent();
			$('.room-status').addClass('busy');
			$('.room-status').removeClass('free');
			$('.room-status-title').text('Occupée');
			$('.change-status').text('Rendre libre');
		}
		else{
			endEvent();
			$('.room-status').addClass('free');
			$('.room-status').removeClass('busy');
			$('.room-status-title').text('Libre');
			$('.change-status').text('Rendre occupée');
		}
	});
	
	$('button.book-room').click(function(){
		if($(this).hasClass('cancel')){
			$('.viewport').removeClass('show-book-room');
			$(this).removeClass('cancel');
			$(this).text('Faire une réservation');
		}
		else{
			$('.viewport').addClass('show-book-room');
			$(this).addClass('cancel');
			$(this).text('Annuler');
		}
	});
	
	$(document.body).on('click','.calendar-select button',function(){
		$('.calendar-select button').removeClass('selected');
		$(this).addClass('selected');
	});
	
	$('.calendar-select .modal-next').click(function(){
		if($('.calendar-select button.selected').length > 0){
			selectCalendar($('.calendar-select button.selected').attr('data-calendar-id'));
			$('.modal').removeClass('active');
		}
	});
	
	$('.google-connect').click(function(){
      authorize();
	});
	
	$('.book-room input[type=submit]').click(function(e){
  	  e.preventDefault();
	    createEvent();
	});
	
	moment.locale('fr');
	displayTime();
	setTimeout(reverseDisplay, 1000*60*5);
});

function displayTime() {
    var time = moment().format('H[h]mm');
    $('.current-time').html(time);
    $('.current-day').html(moment().format('dddd'));
    $('.current-day-date').html(moment().format('D'));
    $('.current-month').html(moment().format('MMMM'));
    
    if(moment().seconds() == 0){
	    updateCalendar(true);
	}
    
    setTimeout(displayTime, 1000);
}

function reverseDisplay() {
	if($('.viewport').hasClass('show-book-room')){
	    setTimeout(reverseDisplay, 1000*60*1);
	}
	else{
		var room_status = $('.room-status').detach();
		var book_room = $('.viewport > .book-room').detach();
		if($('.viewport').hasClass('reverse')){
			$('.viewport').removeClass('reverse');
			book_room.appendTo('.viewport');
			room_status.prependTo('.viewport');
		}
		else{
			$('.viewport').addClass('reverse');
			room_status.appendTo('.viewport');
			book_room.prependTo('.viewport');
		}
		
	    setTimeout(reverseDisplay, 1000*60*5);
	}
}