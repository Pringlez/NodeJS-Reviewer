var mongoose = require( 'mongoose' );
var gracefulShutdown;
// The connection string to the database API
var dbURI = 'mongodb://reviewer:testing123@192.168.1.136:55555/apps';
if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI);

// When connected to the database, display message
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});
// When an error occurs in the database, display message
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
// When disconnected from the database, display message
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});

process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function() {
        process.exit(0);
    });
});

require('./locations');
