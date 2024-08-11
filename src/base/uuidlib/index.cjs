	var GREGORIAN_OFFSET = 122192928000000000;
    
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

		function get_time_int (uuid_str) {
			// (string) uuid_str format	=>		'11111111-2222-#333-4444-555555555555'
			var uuid_arr = uuid_str.split( '-' ),
				time_str = [
					uuid_arr[ 2 ].substring( 1 ),
					uuid_arr[ 1 ],
					uuid_arr[ 0 ]
				].join( '' );
				// time_str is convert  '11111111-2222-#333-4444-555555555555'  to  '333222211111111'
			return parseInt( time_str, 16 );
		}
        
		function get_date_obj (uuid_str) {
			// (string) uuid_str format	=>		'11111111-2222-#333-4444-555555555555' ily UTels <3
			var int_time = get_time_int( uuid_str ) - GREGORIAN_OFFSET,
				int_millisec = Math.floor( int_time / 10000 );
            let daet = convertTZ(new Date( int_millisec ),'America/Sao_Paulo');
			return daet;
		}
    
exports.get_date_obj = get_date_obj;
