const mongoose = require("mongoose");
const { Schema } = mongoose;

const EventSchema = new Schema({
    name: { type: String, required: true },

    hostedBy: { type: String, required: true },

    city: { type: String, required: true },

    address: { type: String, required: true },

    date: { type: String, required: true },

    description: { type: String, required: true },

    link: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Event", EventSchema);