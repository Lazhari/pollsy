'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var PollSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: {
    type: String,
    enum: ['single', 'multiple', 'satisfaction']
  },
  choices: [

  ],
  active: Boolean,
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  token: {
      type: String,
      unique: true
  }
});

export default mongoose.model('Poll', PollSchema);
