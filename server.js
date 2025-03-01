const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const InfractionLog = require('./Schemas.js/InfractionLog');

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON data

require('dotenv').config();
const PASSWORD = process.env.PASSWORD;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Get all infractions
app.get('/infractions', async (req, res) => {
    try {
        const infractions = await InfractionLog.find();
        res.json(infractions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch infractions' });
    }
});

app.delete('/infractions/:id', async (req, res) => {
    const { password } = req.body;
    if (password !== PASSWORD) {
        return res.status(403).json({ error: 'Incorrect password' });
    }

    try {
        const infraction = await InfractionLog.findByIdAndDelete(req.params.id);
        if (!infraction) {
            return res.status(404).json({ error: 'Infraction not found' });
        }
        res.json({ message: 'Infraction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete infraction' });
    }
});

app.put('/infractions/:id', async (req, res) => {
    const { password, reason, outcome, appealable, notes } = req.body;
    if (password !== PASSWORD) {
        return res.status(403).json({ error: 'Incorrect password' });
    }

    try {
        const updatedInfraction = await InfractionLog.findByIdAndUpdate(
            req.params.id,
            { reason, outcome, appealable, notes },
            { new: true }
        );
        if (!updatedInfraction) {
            return res.status(404).json({ error: 'Infraction not found' });
        }
        res.json(updatedInfraction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update infraction' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
