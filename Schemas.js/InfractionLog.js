const mongoose = require('mongoose');

const InfractionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    reason: { type: String, required: true },
    outcome: { type: String, required: true },
    appealable: { type: Boolean, required: true },
    notes: { type: String, default: 'None' },
    issuedBy: { type: String, required: true },
    issuedByName: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    discordMessageId: { type: String, required: true }
});

module.exports = mongoose.model('InfractionLog', InfractionSchema);
