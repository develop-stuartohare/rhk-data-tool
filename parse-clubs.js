const csvToJson = require('./csv-to-json');
const path = require('path');
const camelCase = require('camelcase');

const categories = {
    'Childcare':'childcare',
    'Arts and Crafts':'artsAndCrafts',
    'Performing Arts':'performingArts',
    'Performing arts':'performingArts',
    'Baby/Toddler/Family':'babyToddlerFamily',
    'Wellbeing':'wellbeing',
    'Sports':'sports',
    'Uniforms':'uniforms',
    'Hangout':'hangout',
    'Activities (Indoors)':'activitiesIndoors',
    'Activities (Outdoors)':'activitiesOutdoors',
    'Activity (Outdoors)':'activitiesOutdoors',
    'Technology':'technology',
    'Food':'food',
    'Baby/Toddler Group':'babyToddlerGroup',
    'Languages':'languages',
    'Education':'education'
};

const brightonGeo=[
    -0.1406424,
    50.8289749
]

const mapRecord = r =>{
    if(!r.NAME) return false;

    var newR = {}
    for(var key in r){
        if(key.length){
            let newKey= key.replace(/[^\w]/gi, '');
            r[key] = r[key].replace('\n', '');
            newR[newKey] = r[key];
        }
    }

    r = newR;
    // console.log(r);
    r.CATEGORY = r.CATEGORY.trim();
    const category = categories[r.CATEGORY];
    if(!category){
        console.log(r.CATEGORY);
    }

    const mapped = {
        name: r.NAME,
        category,
        keywords: r.KEYWORDS.split(','),
        address:{
            field1: r.ADD1,
            field2: r.ADD2,
            field3: "",
            town: r.ADD3,
            county: r.COUNTY,
            postcode: r.POSTCODE,
            geolocation: brightonGeo,
            telephone: r.TEL
        },
        contactTitle: r.TITLE,
        contactFirstName:r.FIRSTNAME,
        contactSurname: r.SURNAME,
        ageStart: r.AGEFROM.length ? parseInt(r.AGEFROM): 0,
        ageEnd: r.AGETO.length ? parseInt(r.AGETO): 20,
        email: r.EMAIL.replace('?','').trim(),
        website:r.WEB,
        description: r.SUMMARY,
        daysOfTheWeek:[
            r.Mon === "" ? 0 : 1,
            r.Tues === "" ? 0 : 2,
            r.Wed === "" ? 0 : 4,
            r.Thur === "" ? 0 : 8,
            r.Fri === "" ? 0 : 16,
            r.Sat === "" ? 0 : 32,
            r.Sun === "" ? 0 : 64
        ]

    };

    mapped.geolocation = brightonGeo;
    mapped.daysOfTheWeek = mapped.daysOfTheWeek.reduce((acc, val)=> acc+val, 0);
    if(mapped.daysOfTheWeek === 0) mapped.daysOfTheWeek = 127;

    mapped.isDropOff = r["STAYWITHCHILDTRUE"] === "TRUE" ? false: true;
    mapped.isParty = r["PARTYTRUE"] === "TRUE" ? true: null;

    mapped.status = "open";
    mapped.isApproved = true;

    for(var key in mapped){
        if(mapped[key] === ""){
            mapped[key] = null;
        }
    }

    return mapped;
};


csvToJson({
    file:path.resolve(__dirname, './data/RHK clubs 070217.csv'),
    // from: 0,
    // to:2000,
    map:mapRecord
});
