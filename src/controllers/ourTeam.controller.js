const OurTeam = require('../models/OurTeam.model');
const fs = require('fs').promises;
const path = require('path');

// ==================== GET OUR TEAM DATA ====================
exports.getOurTeam = async (req, res) => {
    try {
        let data = await OurTeam.findOne().sort({ createdAt: -1 });

        if (!data) {
            data = await OurTeam.create({
                subheading: 'OUR TEAM',
                heading: 'Guiding Visionary Spaces',
                highlightText: 'Visionary Spaces',
                description: 'Decades of expertise in crafting premium interiors and architectural excellence.',
                footerQuote: '"Our leadership\'s commitment to excellence ensures that each project reflects the highest standards of luxury and innovation."',
                buttonText: 'Work With Us',
                buttonUrl: '#',
                members: []
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Our Team data',
            error: error.message
        });
    }
};

// ==================== UPDATE GLOBAL CONTENT ====================
exports.updateGlobalContent = async (req, res) => {
    try {
        const { subheading, heading, highlightText, description, footerQuote, buttonText, buttonUrl } = req.body;

        let data = await OurTeam.findOne().sort({ createdAt: -1 });

        if (!data) {
            data = new OurTeam();
        }

        data.subheading = subheading || data.subheading;
        data.heading = heading || data.heading;
        data.highlightText = highlightText || data.highlightText;
        data.description = description || data.description;
        data.footerQuote = footerQuote || data.footerQuote;
        data.buttonText = buttonText || data.buttonText;
        data.buttonUrl = buttonUrl || data.buttonUrl;

        await data.save();

        res.status(200).json({
            success: true,
            message: 'Section content updated successfully',
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update section content',
            error: error.message
        });
    }
};

// ==================== ADD TEAM MEMBER ====================
exports.addMember = async (req, res) => {
    try {
        const { name, position, altText, linkedinUrl, mailUrl } = req.body;

        let data = await OurTeam.findOne().sort({ createdAt: -1 });

        if (!data) {
            data = await OurTeam.create({ members: [] });
        }

        const newMember = {
            name,
            position,
            altText: altText || '',
            linkedinUrl: linkedinUrl || '',
            mailUrl: mailUrl || '',
            image: req.file ? `/uploads/team/${req.file.filename}` : ''
        };

        data.members.push(newMember);
        await data.save();

        res.status(201).json({
            success: true,
            message: 'Team member added successfully',
            data: data.members[data.members.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add team member',
            error: error.message
        });
    }
};

// ==================== UPDATE TEAM MEMBER ====================
exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const data = await OurTeam.findOne().sort({ createdAt: -1 });

        if (!data) {
            return res.status(404).json({ success: false, message: 'Data not found' });
        }

        const memberIndex = data.members.findIndex(member => member._id.toString() === id);

        if (memberIndex === -1) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        // Handle image update
        if (req.file) {
            // Delete old image if it exists
            const oldImage = data.members[memberIndex].image;
            if (oldImage && oldImage.startsWith('/uploads/team/')) {
                try {
                    const oldPath = path.join(process.cwd(), oldImage);
                    await fs.unlink(oldPath);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }
            updateData.image = `/uploads/team/${req.file.filename}`;
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (key !== '_id') {
                data.members[memberIndex][key] = updateData[key];
            }
        });

        await data.save();

        res.status(200).json({
            success: true,
            message: 'Team member updated successfully',
            data: data.members[memberIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update team member',
            error: error.message
        });
    }
};

// ==================== DELETE TEAM MEMBER ====================
exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await OurTeam.findOne().sort({ createdAt: -1 });

        if (!data) {
            return res.status(404).json({ success: false, message: 'Data not found' });
        }

        const member = data.members.id(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        // Delete image file
        if (member.image && member.image.startsWith('/uploads/team/')) {
            try {
                const filePath = path.join(process.cwd(), member.image);
                await fs.unlink(filePath);
            } catch (err) {
                console.error('Error deleting image file:', err);
            }
        }

        data.members.pull(id);
        await data.save();

        res.status(200).json({
            success: true,
            message: 'Team member deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete team member',
            error: error.message
        });
    }
};
