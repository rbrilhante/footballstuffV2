var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompetitionSchema = new Schema({
 year: String,
 num_leagues: Number
 //leagues: [{type: Schema.ObjectId, ref: 'League'}]
});

module.exports = mongoose.model('Competition', CompetitionSchema);