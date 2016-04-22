var User = require('../models/user');

var faker = require('faker');
var moment = require('moment');
var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pollsy');
var users = [];

for(var i=0; i<_.random(400, 1000); i++) {
    var user = {
        country: faker.address.country(),
        email: faker.internet.email(),
        paypalAccount: faker.internet.email(),
        firstName: faker.name.firstName(),
        role:'user',
        gender: _.sample(["Homme", "Femme"]),
        lastName: faker.name.firstName(),
        phone: faker.phone.phoneNumber(),
        active: _.sample([false, true]),
        password: faker.name.firstName(),
        location: {
            lat: faker.address.latitude(),
            lng: faker.address.longitude()
        },
        address: {
            "city": faker.address.city(),
            "country": faker.address.country(),
            "address1": faker.address.streetAddress(),
            "address2": faker.address.secondaryAddress(),
        },
        fullName: faker.internet.userName(),
        updated: faker.date.past(),
        created: faker.date.past()
    };
    users.push(user);
}
async.eachSeries(users, function(user, cb) {
    var userObject = new User(user);
    userObject.save(cb);
}, function(err) {
    if(err) console.log(err);
    console.log('Done add users');
});
