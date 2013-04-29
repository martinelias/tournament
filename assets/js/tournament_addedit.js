// Declare global variables
var new_participant_id = 0;
var participant_array = new Array();
var tournament_id = 0;
var groups = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
var participant_name_field;
var participants_table_body;
var institute_name_field;
var max_groups_field;
var current_group_number = -1;
var row_scores = [];
var final_scores = {};
var games_array;
var tournament_type = -1;
var playoff_array = [];

function get_group_member_count(pool_name) {
	var counter = 0;
	participants_table_body.find('tr').each(function () {
		var this_pool_name = $(this).find('td:nth-child(4)').html().trim();
		if (this_pool_name == pool_name) {
			counter++;
		}
	})
	return counter;
};

//???!!!??
function flp2(x) {
	x = x | (x >> 1);
	x = x | (x >> 2);
	x = x | (x >> 4);
	x = x | (x >> 8);
	x = x | (x >> 16);
	return x - (x >> 1);
}

function calculatematchups(number) {

	var r = Math.log(number) / Math.LN2;
	var result = Math.pow(2, r) - number;
	var y = flp2(number);
	result = number - ((number - y) * 2);
	console.debug(result);
	return(result);

}

function add_playoff() {
	var levelnr = 0;
	var playernumber = 7;
	var proper_matches = 0;
	var bye_spacing = 0;


	$('#tabs-4').empty();
	var playoff_table = "";
//$('#tabs-4').append('<h3>Alagrupp ' + groups[i] + '</h3>');
	var playoff_table_header = '<th width="120px" height="25px">' + "Level " + levelnr + '</th>';
	$('#tabs-4').append('<table id="playoff-table" class="table table-bordered playoff-table"><tbody><tr>' + playoff_table_header + '</tr></tbody></table>');
	var byes = calculatematchups(playernumber);
	if (byes > 0) {
		//get number of proper matches (no byes)
		proper_matches = (playernumber - byes) / 2;
		//get number of byes grouped with a proper match in the next level
		//always select the smaller of byes and proper matches
		byes_with_propers  = byes>proper_matches?proper_matches:byes;
		//get number of byes playing each other in the next level
		bye_pairs = (byes-byes_with_propers)/2;
	}

	var i = 0;
	for (var index in playoff_array) {
		for (var index2 in playoff_array[index]) {
			//don't leave a space between headers and first row
			if (i == 0) {
				$('#playoff-table').append('<tr>' + playoff_table + '</tr>');
			}
			else {
				$('#playoff-table').append('<tr>' + playoff_table + '</tr><tr><td></td></tr>');
			}
			i++;

			//distribute byes
			if (byes_with_propers > 0 && bye_spacing ==0 && byes>0) {
				playoff_table = '<td><div >' +playoff_array[index][index2][0] +" bye_with_proper" + '</div></td>';
				byes_with_propers--;
				//build the proper group before adding another bye
				bye_spacing=2;
			}
			else {
				playoff_table = '<td><div >' + playoff_array[index][index2][0] + '</div></td>';
				bye_spacing --;
			}


		}
	}
	// Generate body


}


function add_group() {
	$('#tabs-3').empty();
	var participants_row = new Array();
	var participants_cell = new Array();


	// Iterate sub-group tables
	for (var i = 0; i < $('#max_groups').val(); i++) {
		var j = 0;
		if (!document.getElementById('group-table' + groups[i] + '')) {
			group_table_header = '<th></th>';
			participants_table_body.find('tr').each(function () {
				var this_group_name = $(this).find('td:nth-child(4)').html().trim();
				var participant_name = $(this).find('td:nth-child(2) input').val();
				var participant_id = $(this).attr('id');
				if (typeof participants_cell[this_group_name] == 'undefined') {
					participants_cell[this_group_name] = new Array();
					row_scores[this_group_name] = [];
					playoff_array[this_group_name] = [];
				}
				if (this_group_name == groups[i]) {
					group_table_header += '<th width="120px" height="25px">' + participant_name + '</th>';
					participants_cell[this_group_name].push(participant_id);
					row_scores[this_group_name].push(participant_id);
					row_scores[this_group_name][participant_id] = new Array();
					playoff_array[this_group_name][j] = [];
					playoff_array[this_group_name][j].push(participant_name);
					playoff_array[this_group_name][j].push(participant_id);

					j++;
				}
				participants_row.push(participant_id);

			});
			$('#tabs-3').append('<h3>Alagrupp ' + groups[i] + '</h3>');

			$('#tabs-3').append('<table id="group-table' + groups[i] + '" class="table table-bordered group-table"><tbody><tr>' + group_table_header + '<th width="120px">punktide vahe</th><th width="50px">punkte</th><th width="50px">koht</th></tr></tbody></table>');
		}


	}
	console.debug(playoff_array);
	// For each participant...
	participants_table_body.find('tr').each(function () {
		var group_name = $(this).find('td:nth-child(4)').html().trim();  // A
		var participant_name = $(this).find('td:nth-child(2) input').val(); // Juku
		var participant_id = $(this).attr('id');

		// Generate body row
		var row = $(this).index();
		//editable fields
		group_table = '';
		//members in group
		var members = get_group_member_count(group_name);
		for (cell = 0; cell < members; cell++) {

			//fetch participant id's
			//We assume participants have been saved once (existing_participant+id)
			var id_a = participant_id.substring(20, participant_id.length);
			var id_b = (participants_cell[group_name][cell]).substring(20, (participants_cell[group_name][cell]).length);


			//this mess creates unique composite id's with a reversed one to look up the other side of the input pair
			var composite_id_a = id_a + "_" + tournament_id + "_" + id_a + "_" + id_b;
			var reverse_id_a = id_a + "_" + tournament_id + "_" + id_b + "_" + id_a;
			var composite_id_b = id_b + "_" + tournament_id + "_" + id_a + "_" + id_b;
			var reverse_id_b = id_b + "_" + tournament_id + "_" + id_b + "_" + id_a;
			// plus composites for score fields
			var composite_id_score = tournament_id + "_" + id_a + "_" + id_b;
			//
			var composite_id_score_difference = tournament_id + "_" + id_a + "_score_difference";
			var composite_id_score_difference_points = tournament_id + "_" + id_a + "_score_difference_points";
			var composite_id_points_total = tournament_id + "_" + id_a + "_score_total";
			var composite_id_score_place = tournament_id + "_" + id_a + "_score_place";

			row_scores[group_name][participant_id].push(composite_id_score);
			row_scores[group_name][participant_id][composite_id_score] = new Array();
			row_scores[group_name][participant_id][composite_id_score].push(composite_id_a);
			row_scores[group_name][participant_id][composite_id_score].push(composite_id_b);
			//if input changes, change its reciprocal input too
			//package all needed data to the inputs - its unique id, its mirror's id, its neighbour's id and the score id
			var input_a = '<input style="border-radius: 0;" id="' + composite_id_a + '" name="a" reverseid="' + reverse_id_a + '" neighbourid="' + composite_id_b + '" membercount="' + members + '" scoreid="' + composite_id_score + '" groupid="' + group_name + '" rowid="' + participant_id + '" type="number" value="0" class="score-input" onchange="changescore.call(this)">';
			var input_b = '<input style="border-radius: 0;" id="' + composite_id_b + '" name="b" reverseid="' + reverse_id_b + '" neighbourid="' + composite_id_a + '" membercount="' + members + '" scoreid="' + composite_id_score + '" groupid="' + group_name + '" rowid="' + participant_id + '" type="number" value="0" class="score-input" onchange="changescore.call(this)">';
			var score = '<p><strong  id="' + composite_id_score + '">' + "-" + '</strong></p>';
			var score_difference = '<p><strong  id="' + composite_id_score_difference + '">' + "-" + '</strong></p>';
			var score_difference_points = '<p><strong  id="' + composite_id_score_difference_points + '">' + "-" + '</strong></p>';

			var points_total = '<p><strong  id="' + composite_id_points_total + '">' + "0" + '</strong></p>';
			var score_place = '<p><strong  id="' + composite_id_score_place + '">' + "-" + '</strong></p>';

			//store participant id's in cells
			group_table += '<td><div class="score_cell">' + score + input_a + ":" + input_b + '</div></td>';

		}
		//summary fields
		for (cell = 0; cell < 3; cell++) {

			//punktide vahe
			if (cell == 0) {
				group_table += '<td><div class="score_cell">' + score_difference + score_difference_points + '</div></td>';
				row_scores[group_name][participant_id].push(composite_id_score_difference);
				row_scores[group_name][participant_id].push(composite_id_score_difference_points);
			}
			//kogupunktid
			if (cell == 1) {
				group_table += '<td><div class="score_cell">' + points_total + '</div></td>';
				row_scores[group_name][participant_id].push(composite_id_points_total);
			}
			//koht
			if (cell == 2) {
				group_table += '<td><div class="score_cell">' + score_place + '</div></td>';
				row_scores[group_name][participant_id].push(composite_id_score_place);
			}
		}


		// Generate body
		$('#group-table' + group_name).append(
			'<tr>' +
				'<th width="120px" height="25px">' + participant_name + '</th>' + group_table +
				'</tr>');
	});


	black_background();
	add_playoff();
}
function black_background() {
	for (var i = 0; i < $('#max_groups').val(); i++) {
		var counter = 1;
		$('#group-table' + groups[i] + '').find('tr').each(function () {
			$(this).find('td:nth-child(' + counter + ')').addClass('blackbackground').html('');
			counter++;
		})
	}
}

function prepare_game_array() {
	//write the array out to a more manageable form
	for (var grp in row_scores) {

		for (var i = 0; i < row_scores[grp].length; i++) {
			var a_participant = row_scores[grp][i];
			var c = 0;
			for (var cell in row_scores[grp][a_participant]) {
				c++;


				if (c > row_scores[grp][a_participant].length) {

					cell_id = row_scores[grp][a_participant][cell];

					var check = checkscore(cell_id);
					if (check != false) {
						final_scores[cell_id[0]] = {};
						final_scores[cell_id[0]]['game_id'] = cell_id[0];
						final_scores[cell_id[0]]['tournament_id'] = getid(cell_id[0], 1);
						final_scores[cell_id[0]]['participant_a_id'] = getid(cell_id[0], 2);
						final_scores[cell_id[0]]['participant_b_id'] = getid(cell_id[0], 3);
						final_scores[cell_id[0]]['participant_a_score'] = getscore(cell_id, 0);
						final_scores[cell_id[0]]['participant_b_score'] = getscore(cell_id, 1);
					}


				}
			}
		}
	}


	function checkscore(double_id) {
		//returned string
		var str = "";
		var element;
		var reverse_id;
		//split the id
		for (var i = 0; i < double_id.length; i++) {
			//find elements
			element = $('#' + double_id[i] + '').val();
			reverse_id = $('#' + double_id[i] + '').attr('reverseid');
			if (!element) {
				return false;
			}
			//game exists, don't insert
			if (final_scores[reverse_id]) {
				return false;
			}

		}
		return true;
	}

	function getid(id, place) {
		var soup = id.split("_");
		return soup[place];
	}

	function getscore(id, place) {
		return $('#' + id[place] + '').val();
	}

}


function sumcells(index, group, member_count) {

	var score = 0;
	var score_id;
	var total_score_a = 0;
	var total_score_b = 0;
	//we have the index for the changed row, get the subarray and sum the elements
	for (var i = 0; i < row_scores[group][index].length; i++) {
		score_id = row_scores[group][index][i];

		//we are summing the scores
		if (($('#' + score_id + '').text() != "") && ($('#' + score_id + '').text() != "-") && (i < member_count)) {
			score += parseInt($('#' + score_id + '').text(), 10);

			var score_input_a = row_scores[group][index][score_id][0];
			var score_input_b = row_scores[group][index][score_id][1];
			total_score_a += parseInt($('#' + score_input_a + '').val(), 10);
			total_score_b += parseInt($('#' + score_input_b + '').val(), 10);
		}

		//we are at score difference
		if (i == member_count) {
			//set score difference
			$('#' + score_id + '').text(total_score_a - total_score_b);
		}
		//we are at score difference point
		if (i == member_count + 1) {
			///set score difference in points
			$('#' + score_id + '').text(total_score_a + ":" + total_score_b);
		}

		//we are at total score cell
		if (i == member_count + 2) {
			$('#' + score_id + '').text(score);
		}

		//we are at place cell
		if (i == member_count + 3) {
			//set place
			$('#' + score_id + '').text(score);
			changeplace();
		}

	}

	function changeplace() {
		var scorearray = [];
		var placearray = [];

		for (var j = 0; j < row_scores[group].length; j++) {
			var foreign_total_score_index = row_scores[group][row_scores[group][j]].length - 2;
			var foreign_total_score_id = row_scores[group][row_scores[group][j]][foreign_total_score_index];
			var foreign_total_place_index = row_scores[group][row_scores[group][j]].length - 1;
			var foreign_total_place_id = row_scores[group][row_scores[group][j]][foreign_total_place_index];

			var foreign_score = parseInt($('#' + foreign_total_score_id + '').text());

			//insert at the bottom and percolate up
			scorearray.push(foreign_score)
			placearray.push(foreign_total_place_id);
			var sorted = false;
			var pos = scorearray.length - 1;
			var tmp;
			while (!sorted && scorearray.length > 1) {
				if (scorearray[pos] > scorearray[pos - 1]) {
					tmp = scorearray[pos];
					scorearray[pos] = scorearray[pos - 1];
					scorearray[pos - 1] = tmp;

					tmp = placearray[pos];
					placearray[pos] = placearray[pos - 1];
					placearray[pos - 1] = tmp;

					pos--;
				}
				else {
					sorted = true;
				}

			}
		}

		//we have the sorted places, assign the numbers
		for (var k = 0; k < placearray.length; k++) {
			$('#' + placearray[k] + '').text(k + 1);
		}

	}

}


function changescore() {

	//TODO deal with possible nonnumerical values
	//get mirrored cell
	var reverse_id = $(this).attr('reverseid');
	var mirrored_cell = $('#' + reverse_id + '');
	//get current cell value
	var value = parseInt($(this).val());
	//get row id
	var row_id = $(this).attr('rowid');
	//get subgroup id
	var group_id = $(this).attr('groupid');
	//get members in group
	var member_count = parseInt($(this).attr('membercount'), 10);


	//get neighbour cell value
	var neighbour_id = $(this).attr('neighbourid');
	var neighbour_value = parseInt($('#' + neighbour_id + '').val());

	//get score element
	var score_id = $(this).attr('scoreid');

	//get cell name
	var name = $(this).attr('name');

	win_points = $('input[name="tournament[tournament_game_win]"]').val();
	tie_points = $('input[name="tournament[tournament_game_tie]"]').val();
	loss_points = $('input[name="tournament[tournament_game_loss]"]').val();


	//compare
	if (value > neighbour_value) {
		if (name == "a") {
			$('#' + score_id + '').text(win_points);
		}
		if (name == "b") {
			$('#' + score_id + '').text(loss_points);
		}
	}

	if (value == neighbour_value) {
		$('#' + score_id + '').text(tie_points);
	}

	if (value < neighbour_value) {
		if (name == "a") {
			$('#' + score_id + '').text(loss_points);
		}
		if (name == "b") {
			$('#' + score_id + '').text(win_points);
		}
	}

	//only change the mirrored element if they differ
	if (mirrored_cell.val() != value) {
		//change value
		mirrored_cell.val('' + value + '');
		//go through comparison on the other side too
		changescore.call(mirrored_cell);
	}

	//give the index for the subarray to be summed, we need to sum the cells in it again
	sumcells(row_id, group_id, member_count);

}


function set_participant_type() {
	$('.tournament_participant').html(document.getElementById('tournament_participant').value);
}
function get_scores(a, b) {

	if (typeof a == 'undefined' || typeof b == 'undefined' || a.substr(0, 3) == 'new') {
		return 'andmed puuduvad';
	}
	else {
		obj = JSON.parse(get_scores_ajax(a, b));
		return obj['a'] + ':' + obj['b'];
	}
}
function get_scores_ajax(a, b) {
	return $.ajax({type: 'post', name: 'test', dataType: 'json', url: BASE_URL + 'tournaments/get_scores', a: a, b: b, async: false})
		.done(function (msg) {
		}).responseText;
}


function set_unit_type() {
	$('.tournament_classification').html(document.getElementById('tournament_classification').value)
}

function get_pool_name() {

	current_group_number = (current_group_number++ >= max_groups_field.val() - 1) ? 0 : current_group_number;
	return groups[current_group_number];
}
function update_participant_count() {
	$('#participant-count').html(Math.round(participants_table_body.find('tr').length / $('#max_groups').val()));
}

// Import participants from an Excel (or equivalent) file
function import_participants() {
	//$input = document.getElementById('import-participants').innerHTML;
	var input = $('textarea#import-participants').val();
	var rows = input.split("\n");

	// Participant template
	function participant(participant, unit, pool, favorite) {
		this.participant = participant,
			this.unit = unit,
			this.pool = pool,
			this.favorite = favorite;
	}

	// Save rows as (participant) objects & place those objects into one (participants) array
	for (var r = 0; r < rows.length; r++) {
		var fields = rows[r].split("\t");                       //what if there are spaces or sth similar?
		var field_array = new Array();

		for (var f = 0; f < fields.length; f++) {
			field_array[f] = fields[f];
		}

		// Any alphabetic or numeric char (except 0) makes 'favorite == true'
		var favorite = function () {
			var fav_value = field_array[3];
			if (/[a-zA-Z1-9]/.test(fav_value)) {
				return true;
			}
			else {
				return false;
			}
		};
		participant_array[r] = new participant(field_array[0], field_array[1], field_array[2], favorite());
		console.log(participant_array[r]);
	}
	//console.log(participant_array[0].participant);
	for (var p in participant_array) {
		add_participant(participant, unit, pool, favorite);
	}
}

function add_participant_wrapper() {
	var participant = participant_name_field.val();
	var unit = $('[name="institute_name"]').val();
	var pool = get_pool_name();
	var favorite = false;
	add_participant(participant, unit, pool, favorite);
}

function add_participant(participant, unit, pool, favorite) {
	// Verify that the participant name field is correctly filled, or else abort
	if (!participant_name_field.val()) {
		participant_name_field.addClass('viga');
		return false;
	}
	var institute_name_length = unit.length;
	if (institute_name_length > 17) {
		alert("Instituudi nimi on liiga pikk!");
		return false;
	}

	// Verify that the participant names are not same
	if (!verify_participant_names()) {
		return false;
	}
	// Add new row to participants' table
	var checked = favorite ? 'checked="checked"' : '';
	participants_table_body.append('' +
		'<tr id="new_participant' + new_participant_id + '">' +
		'<td>x</td>' +
		'<td>' + participant.trim() + '</td>' +
		'<td>' + institute_name_field.val().trim() + '</td>' +
		'<td>' + pool + '</td>' +
		'<td><input type="checkbox"></td>' +
		'<td>' +
		'<a href="#" onclick="if (confirm(' + "'Oled kindel?')) remove_participant('new_participant" + new_participant_id + "')" + '"><i class="icon-trash"></i></a>' +
		'</td>' +
		'</tr>');

	// Bump participants' array's next id number
	new_participant_id++;

	// Clear participant name and institute fields
	institute_name_field.val('');
	participant_name_field.val('');

	// Reset numbers
	reset_numbers();

	// Update participant count
	update_participant_count();
	// Cancel <a>'s onclick event to prevent page reload
	return false;
}
function verify_participant_names() {
	var fail = 0;
	participants_table_body.find('tr').each(function () {
		var participant_name = $(this).find('td:nth-child(2)').find('input').val();
		if (participant_name == participant_name_field.val().trim()) {
			fail = 1;
			return false;
		}
	});
	if (fail) {
		if (!confirm('Oled kindel?')) {
			return false;
		}
		else {
			return true;
		}
	} else {
		return true;
	}
}

/**
 * Reorganizes groups based on max_group field value.
 */
function reinit_groups() {

	// Reset table
	participants_table_body.find('tr').each(function () {

		// Overwrite group cell
		var new_pool_name = get_pool_name();
		$(this).find('td:nth-child(4)').html(new_pool_name);
		var participant_id = $(this).attr('id');
	});
	update_participant_count();
	add_group();
}
function reset_numbers() {

	// Initialize row counter
	var n = 1;

	// Iterate through each first cell in every row in participants table and write row number
	participants_table_body.find('>tr>td:nth-child(1)').each(function () {
		$(this).html(n++ + '.');
	});
}

function submit1() {

	// Check that tournament_name is given
	if (!$('#tournament-name').val()) {
		$('#tournament-name').addClass('viga');
		$("#tabs").tabs("option", "active", 0);
		alert("Turniiri nimi on puudu!");
		return false;
	}

	// Check that tournament_place is given & its length is under 21
	if ($('input[name="tournament[place_name]"]').val().length > 21) {
		$("#tabs").tabs("option", "active", 0);
		alert("Koht ei saa nii pikk olla!");
		return false;
	}

	// Check that game length is not 0
	if (!$('#game-length').val() || $('#game-length').val() == '0' || $('#game-length').val() == '00') {
		$('#game-length').addClass('viga');
		$("#tabs").tabs("option", "active", 0);
		alert("Mängu pikkus on 0!");
		return false;
	}

	// Create participants array
	var participants = {};


	participants_table_body.find('tr').each(function () {
		var participant_id = $(this).attr('id');
		participants[participant_id] = {};

		//trim the text to remove newline and tab characters
		//if the field is editable, use val, else use text
		//if length > 0, input field exists
		if (($(this).find('td:nth-child(2) input')).length > 0) {
			participants[participant_id]['participant_name'] = $.trim($(this).find('td:nth-child(2) input').val());
		} else {
			participants[participant_id]['participant_name'] = $.trim($(this).find('td:nth-child(2)').text());
		}
		participants[participant_id]['institute_name'] = $.trim($(this).find('td:nth-child(3)').text());
		participants[participant_id]['pool_name'] = $.trim($(this).find('td:nth-child(4)').text());
		participants[participant_id]['participant_favorite'] = $(this).find('td:nth-child(5) input').prop('checked') ? "1" : "0";
	});

	// JSONize participants array
	var json_text = JSON.stringify(participants, null);

	// Assign JSONized array to hidden input field
	$('#participants').val(json_text);

	if (tournament_type == 0 || tournament_type == 1) {
		//create nice array of game results
		prepare_game_array();
		// JSONize game array
		json_text = JSON.stringify(final_scores, null);
		//Assign JSONized array to hidden input field
		$('#games').val(json_text);
	}


	// Check whether the tournament start is set and is earlier than tournament end
	$(".datepicker").datetimepicker();

	var start = $('#tournament_start').val();
	var end = $('#tournament_end').val();

	if (start >= end || !start) {
		$("#tabs").tabs("option", "active", 0);
		alert("Turniiri algus peab olema varasem kui lõpp!");
		$('#tournament_start').addClass('viga');
		$('#tournament_end').addClass('viga');
		if (!start) {
			$('#tournament_start').addClass('viga');
		}
		if (!end) {
			$('#tournament_end').addClass('viga');
		}
		return false;
	}

	if (!$('#tournament_participant').val()) {
		$('#tournament_participant').addClass('viga');
		$("#tabs").tabs("option", "active", 0);
		return false;
	}

	if (!$('#tournament_classification').val()) {
		$('#tournament_classification').addClass('viga');
		$("#tabs").tabs("option", "active", 0);
		return false;
	}

	// Submit form
	$('#tournament-add-form').submit();

}
function remove_participant(id) {

	// Remove specified row from participant table
	$('table#participants-table>tbody>tr#' + id).remove();

	// Reset numbers
	reset_numbers();
	add_group();

	if(id.substring(0,3)!="new"){
		window.location.href = '../remove_participant/'+id.substr(20,id.length);
	}

}

function validate(evt) {
	var theEvent = evt || window.event;
	var key = theEvent.keyCode || theEvent.which;
	key = String.fromCharCode(key);
	var r1 = /[0-9]/;
	var r2 = /[\b]/;
	if (!(r1.test(key) || r2.test(key))) {
		theEvent.returnValue = false;
		if (theEvent.preventDefault) theEvent.preventDefault();
	}
}

function createmultidimArray(length) {
	var arr = new Array(length || 0),
		i = length;

	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while (i--) arr[length - 1 - i] = createArray.apply(this, args);
	}

	return arr;
}

function init_scores() {
	for (var i = 0; i < games_array.length; i++) {
		var score_a = $('#' + games_array[i]['game_id'] + '');
		score_a.val(games_array[i]['participant_a_score']);
		changescore.call(score_a);

		var neighbour_id = score_a.attr('neighbourid');
		var score_b = $('#' + neighbour_id + '');
		score_b.val(games_array[i]['participant_b_score']);
		changescore.call(score_b);

		//var	reverse_id = $('#' + games_array[i]['game_id'] + '').attr('reverseid');
		//$('#' + reverse_id + '').val(games_array[i]['participant_a_score']);

	}
}

$(function () {

	// Write participant table captions
	set_participant_type();
	set_unit_type();

	// Initialize place_name combobox
	$('.makeEditable').editableSelect();

	// Cache repetitive and expensive jQuery element finding operation results to variables (makes it faster)
	institute_name_field = $('input[name="institute_name"]');
	participant_name_field = $('input#participant_name');
	max_groups_field = $('input#max_groups');
	tournament_id = $('input[type=hidden]#tournament_id').val();
	participants_table_body = $('table#participants-table > tbody:last');


	// Initialize spinners
	$('.spinner').spinner();
	$('#max_groups').spinner({
		stop: function (event, ui) {
			current_group_number = -1;
			reinit_groups();
			update_participant_count();
		}
	});


	var keyStop = {
		8 : ":not(input:text, textarea)", // stop backspace = back
		13: "input:text", // stop enter = submit1

		end: null
	};
	$(document).bind("keydown", function (event) {
		var selector = keyStop[event.which];

		if (selector !== undefined && $(event.target).is(selector)) {
			event.preventDefault(); //stop event
		}
		return true;
	});

	var startDateTextBox = $('#tournament_start');
	var endDateTextBox = $('#tournament_end');

	startDateTextBox.datetimepicker({
		dateFormat: 'dd.mm.yy',
		onClose   : function (dateText, inst) {
			if (endDateTextBox.val() != '') {
				var testStartDate = startDateTextBox.datetimepicker('getDate');
				var testEndDate = endDateTextBox.datetimepicker('getDate');
				if (testStartDate > testEndDate)
					endDateTextBox.datetimepicker('setDate', testStartDate);
			}
			else {
				endDateTextBox.val(dateText);
			}
		},
		onSelect  : function (selectedDateTime) {

			var x = startDateTextBox.datetimepicker('getDate');
			x.setDate(x.getDate() + 365);

			endDateTextBox.datetimepicker('option', 'minDate', startDateTextBox.datetimepicker('getDate'));
			endDateTextBox.datetimepicker('option', 'maxDate', x);
		}
	});
	endDateTextBox.datetimepicker({
		dateFormat: 'dd.mm.yy',
		onClose   : function (dateText, inst) {
			if (startDateTextBox.val() != '') {
				var testStartDate = startDateTextBox.datetimepicker('getDate');
				var testEndDate = endDateTextBox.datetimepicker('getDate');
				if (testStartDate > testEndDate)
					startDateTextBox.datetimepicker('setDate', testEndDate);
			}
			else {
				startDateTextBox.val(dateText);
			}
		},
		onSelect  : function (selectedDateTime) {
			startDateTextBox.datetimepicker('option', 'maxDate', endDateTextBox.datetimepicker('getDate'));
		}
	});

	//Display groups on load
	update_participant_count();
	validate(event);
	reinit_groups();

	//if we need to display groups, initialize the values
	if (tournament_type == 0 || tournament_type == 1) {
		init_scores();
	}


})
;
