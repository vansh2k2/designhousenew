const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    altText: {
        type: String,
        default: ''
    },
    linkedinUrl: {
        type: String,
        default: ''
    },
    mailUrl: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const ourTeamSchema = new mongoose.Schema({
    subheading: {
        type: String,
        default: 'OUR TEAM'
    },
    heading: {
        type: String,
        default: 'Guiding Visionary Spaces'
    },
    highlightText: {
        type: String,
        default: 'Visionary Spaces'
    },
    description: {
        type: String,
        default: 'Decades of expertise in crafting premium interiors and architectural excellence.'
    },
    footerQuote: {
        type: String,
        default: '"Our leadership\'s commitment to excellence ensures that each project reflects the highest standards of luxury and innovation."'
    },
    buttonText: {
        type: String,
        default: 'Work With Us'
    },
    buttonUrl: {
        type: String,
        default: '#'
    },
    members: [teamMemberSchema],
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('OurTeam', ourTeamSchema);
