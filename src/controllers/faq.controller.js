const Faq = require('../models/Faq.model');
const { logActivity } = require('./activityLog.controller');

exports.getFaqs = async (req, res) => {
    try {
        let faq = await Faq.findOne();
        if (!faq) {
            faq = await Faq.create({ 
                subheading: 'FAQS', 
                heading: 'Frequently Asked Questions',
                highlightedWord: 'Questions',
                faqs: []
            });
        }
        res.status(200).json({ success: true, data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateHeadings = async (req, res) => {
    try {
        const { subheading, heading, highlightedWord } = req.body;
        let faq = await Faq.findOne();
        
        if (!faq) {
            faq = new Faq({ subheading, heading, highlightedWord });
        } else {
            faq.subheading = subheading;
            faq.heading = heading;
            faq.highlightedWord = highlightedWord;
        }

        await faq.save();
        
        // Log Activity
        await logActivity({
            user: req.user?._id,
            username: req.user?.username,
            action: 'UPDATED',
            section: 'FAQ MANAGEMENT',
            details: 'Updated FAQ section headings'
        });

        res.status(200).json({ success: true, data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addFaqItem = async (req, res) => {
    try {
        const { question, answer, image, altText } = req.body;
        let faq = await Faq.findOne();
        
        if (!faq) {
            faq = new Faq({ faqs: [{ question, answer, image, altText }] });
        } else {
            faq.faqs.push({ question, answer, image, altText });
        }

        await faq.save();

        // Log Activity
        await logActivity({
            user: req.user?._id,
            username: req.user?.username,
            action: 'CREATED',
            section: 'FAQ MANAGEMENT',
            details: `Added new FAQ question: ${question}`
        });

        res.status(200).json({ success: true, data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateFaqItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, image, altText } = req.body;
        let faq = await Faq.findOne();
        
        if (!faq) {
            return res.status(404).json({ success: false, message: 'FAQ section not found' });
        }

        const itemIndex = faq.faqs.findIndex(item => item._id.toString() === id);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'FAQ item not found' });
        }

        faq.faqs[itemIndex] = { ...faq.faqs[itemIndex], question, answer, image, altText };
        await faq.save();

        // Log Activity
        await logActivity({
            user: req.user?._id,
            username: req.user?.username,
            action: 'UPDATED',
            section: 'FAQ MANAGEMENT',
            details: `Updated FAQ question: ${question}`
        });

        res.status(200).json({ success: true, data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteFaqItem = async (req, res) => {
    try {
        const { id } = req.params;
        let faq = await Faq.findOne();
        
        if (!faq) {
            return res.status(404).json({ success: false, message: 'FAQ section not found' });
        }

        const deletedItem = faq.faqs.find(item => item._id.toString() === id);
        faq.faqs = faq.faqs.filter(item => item._id.toString() !== id);
        await faq.save();

        // Log Activity
        await logActivity({
            user: req.user?._id,
            username: req.user?.username,
            action: 'DELETED',
            section: 'FAQ MANAGEMENT',
            details: `Deleted FAQ question: ${deletedItem?.question || 'Unknown'}`
        });

        res.status(200).json({ success: true, data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
