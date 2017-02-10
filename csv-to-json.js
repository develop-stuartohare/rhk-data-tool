const OsGridRef = require('geodesy/osgridref');
const fs = require('fs');
const path = require('path');
const async = require('async');
const csv = require('csv');
const argv = require('yargs').argv;
const records = [];

let inputFile = "";
let argFrom = 0;
let argTo = false;
let recordsCount = 0;
let recordsProcessed = 0;

let mapRecord = record => record;

function onParse(err, data){

	if(err) return console.log(err);
	argTo = argTo ||  data.length;
	data = data.slice(argFrom, argTo);

	recordsCount = data.length;

	console.log('Processing',recordsCount, 'records.....');


	var eachRecord = function(record, done){

        if(record.Easting && record.Northing){
            var ltLng = OsGridRef.osGridToLatLon(new OsGridRef(parseInt(record.Easting), parseInt(record.Northing)));
            record.geolocation = {
                lat: ltLng.lat,
                lng: ltLng.lon
            }
        }
		let mappedRecord = mapRecord(record);
        if(mappedRecord)records.push(mappedRecord);
        return done()
	};

	async.eachSeries(data, eachRecord, onComplete);

}

function onComplete(){

	var appendix = `_${argFrom}-${argTo}.json`;
	var outputFile = argv.output || inputFile.replace(".csv", appendix);

	fs.writeFile(outputFile, JSON.stringify(records, null, 4), function(err) {
		if(err) console.log(err);
		else {
			console.log("JSON saved to " + outputFile);
			console.log(recordsCount, 'records found')
		}
	});
};





module.exports = function({file, map, done, from=0, to}){

    inputFile = file;
    argTo = to || false;
    argFrom = from;
    mapRecord = map;
    console.log('Parsing csv......');
    var readStream = fs.createReadStream(inputFile);
    readStream.pipe(csv.parse({columns: true}, onParse));
}
