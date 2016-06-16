
/** locations indexes **/
db.getCollection("locations").ensureIndex({
  "_id": NumberInt(1)
},[
  
]);

/** locations indexes **/
db.getCollection("locations").ensureIndex({
  "coords": "2dsphere"
},[
  
]);

/** locations records **/
db.getCollection("locations").insert({
  "name": "Starcups",
  "address": "125 High Street, Reading, RG6 1PS",
  "rating": 3,
  "facilities": [
    "Hot Drinks",
    "Food",
    "Premium WiFi"
  ],
  "coords": [
    -0.9690884,
    51.455041
  ],
  "openingTimes": [{
	"days": 'Monday - Friday',
	"opening": '7:00am',
	"closing": '7:00pm',
	"closed": false
},{
	"days": 'Saturday',
	"opening": '8:00am',
	"closing": '5:00pm',
	"closed": false
},{
	"days": 'Sunday',
	"closed": true
}]
});

db.getCollection("locations").insert({
  "name": "PC Cafe",
  "address": "4 Avenue, Cattlepark, RG8 1KS",
  "rating": 4,
  "facilities": [
    "Hot drinks",
    "Food",
    "Premium WiFi"
  ],
  "coords": [
    -0.9690884,
    51.455041
  ],
  "openingTimes": [{
	"days": 'Monday - Friday',
	"opening": '9:00am',
	"closing": '11:00pm',
	"closed": false
},{
	"days": 'Saturday',
	"opening": '9:00am',
	"closing": '9:00pm',
	"closed": false
},{
	"days": 'Sunday',
	"closed": true
}]
});

db.getCollection("locations").insert({
  "name": "Fast Food",
  "address": "4 Avenue, Cattlepark, LG8 1TS",
  "rating": 2,
  "facilities": [
    "Soft Drinks",
    "Hot Food",
    "Premium WiFi"
  ],
  "coords": [
    -0.9690884,
    51.455041
  ],
  "openingTimes": [{
	"days": 'Monday - Friday',
	"opening": '10:00am',
	"closing": '1:00am',
	"closed": false
},{
	"days": 'Saturday',
	"opening": '9:00am',
	"closing": '2:00am',
	"closed": false
},{
	"days": 'Sunday',
	"closed": true
}]
});
