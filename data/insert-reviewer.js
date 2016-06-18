/** location reviews **/
db.locations.update({
    name: 'Starcups'
}, {
    $push: {
        reviews: {
            author: 'Johnny Hat',
            id: ObjectId(),
            rating: 5,
            timestamp: new Date("Jul 16, 2015"),
            reviewText: "Awesome place, great drink & food!"
        }
    }
});

db.locations.update({
    name: 'PC Cafe'
}, {
    $push: {
        reviews: {
            author: 'Tom Grant',
            id: ObjectId(),
            rating: 3,
            timestamp: new Date("Jul 27, 2015"),
            reviewText: "Not a bad place, drink and food could be better although..."
        }
    }
});

db.locations.update({
    name: 'Fast Food'
}, {
    $push: {
        reviews: {
            author: 'John Giles',
            id: ObjectId(),
            rating: 4,
            timestamp: new Date("Jan 4, 2015"),
            reviewText: "Nice food & drink but the place could be cleaned up abit!"
        }
    }
});