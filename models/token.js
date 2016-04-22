'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenSchema = new Schema();
TokenSchema.add({
	user: {
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    token: {
        type:String,
        index:{unique:true}
    },
    used: {type:Boolean, default:false},
    created: Date,
    expired: Date
});

module.exports = mongoose.model('Token', TokenSchema);
