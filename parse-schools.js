const csvToJson = require('./csv-to-json');
const path = require('path');
const camelCase = require('camelcase');

const mapRecord = r =>{

    const mapped = {};

    const numbers = [
        'StatutoryLowAge',
        'StatutoryHighAge',
        'SchoolCapacity',
        'NumberOfPupils',
        'NumberOfBoys',
        'NumberOfGirls',
        'PercentageFSM'
    ]

    for(let field of numbers){
        r[field] = r[field].length ? parseFloat(r[field]) : null;
    }

    for(var key in r){
        let newKey = key.replace("(name)", "").replace(/[^\w]/gi, '');
        if(newKey[1] === newKey[1].toLowerCase()){
            newKey = camelCase(newKey);
        }
        mapped[newKey] = r[key] === "Not applicable" || r[key] === "" ? null : r[key];

        if((newKey.indexOf('Date') !==-1 || newKey === "ofstedLastInsp") && mapped[newKey]){
            mapped[newKey] = mapped[newKey].split("-").reverse().join("-");
        }
    }

    mapped.ageStart = mapped.statutoryLowAge;
    mapped.ageEnd = mapped.statutoryHighAge;
    mapped.name = mapped.establishmentName;

    mapped.address = {
        field1: mapped.street,
        field2: mapped.locality,
        field3: mapped.address3,
        town: mapped.town,
        county: mapped.county,
        postcode: mapped.postcode,
        geolocation: mapped.geolocation,
        telephone: mapped.telephoneNum
    };

    mapped.geolocation = [mapped.geolocation.lng, mapped.geolocation.lat];

    delete mapped.street;
    delete mapped.locality;
    delete mapped.address3;
    delete mapped.town;
    delete mapped.county;
    delete mapped.postcode;
    delete mapped.telephoneNum;

    switch(mapped.religiousCharacter){
		case "None" :
		case "":
		case "Does not apply":
			mapped.religion = "Secular";
			break;
		case 'Jewish':
		case 'jewish':
			mapped.religion = "Jewish";
			break;
		case 'Buddhist':
		case 'buddhist':
			mapped.religion = "Buddhist";
			break;
		case "Muslim" :
		case "muslim" :
			mapped.religion = "Muslim";
			break;
		case "Christian":
		case "christian":
		case "Roman Catholic":
		case "Church of England":
			mapped.religion = "Christian";
			break;
		default:
			mapped.religion = "Other";
	}
    mapped.isReligious = mapped.religion !== "Secular";
    mapped.isIndependent = mapped.typeOfEstablishment.indexOf('ndependent') !== -1 ? true : false;
    mapped.hasBoarding =  mapped.boarders === 'Boarding School' || mapped.boardingEstablishment === 'Has boarders' ? true : false;
    mapped.website = mapped.schoolWebsite;
    mapped.establishmentStatus = mapped.establishmentStatus.toLowerCase();
    mapped.status = mapped.establishmentStatus;
    mapped.isApproved = true;
    delete schoolWebsite;



    return mapped;
};


csvToJson({
    file:path.resolve(__dirname, './data/edubasealldata20170203.csv'),
    from: 0,
    to:2000,
    map:mapRecord
});
