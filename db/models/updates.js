var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UpdatesSchema = new Schema({
 date: Date,
 cycles: Number,
 updated_teams: Number
});

module.exports = mongoose.model('Updates', UpdatesSchema);