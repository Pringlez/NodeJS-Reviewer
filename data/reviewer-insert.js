
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
  "_id": ObjectId("57606c656a875f17150287ab"),
  "name": "Starcups",
  "address": "125 High Street, Reading, RG6 1PS",
  "rating": 3,
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
