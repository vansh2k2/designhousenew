const AboutPage = require('../models/About.model');
const fs = require('fs').promises;
const path = require('path');

// ==================== GET ABOUT PAGE DATA ====================
exports.getAboutPage = async (req, res) => {
  try {
    // Get the latest published about page
    let aboutPage = await AboutPage.findOne({ isPublished: true })
      .sort({ publishedAt: -1 })
      .lean();

    // If no published page exists, get the latest draft
    if (!aboutPage) {
      aboutPage = await AboutPage.findOne()
        .sort({ createdAt: -1 })
        .lean();
    }

    // If still no data, return empty structure
    if (!aboutPage) {
      return res.json({
        success: true,
        data: {
          sections: [],
          descriptionBoxes: [],
          media: {
            images: [],
            videos: []
          },
          isPublished: false
        }
      });
    }

    res.json({
      success: true,
      data: aboutPage
    });
  } catch (error) {
    console.error('Error fetching about page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about page data',
      error: error.message
    });
  }
};

// ==================== GET ABOUT PAGE FOR ADMIN ====================
exports.getAboutPageForAdmin = async (req, res) => {
  try {
    // Get the latest about page (published or draft)
    const aboutPage = await AboutPage.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!aboutPage) {
      return res.json({
        success: true,
        data: {
          sections: [],
          descriptionBoxes: [],
          media: {
            images: [],
            videos: []
          },
          isPublished: false
        }
      });
    }

    res.json({
      success: true,
      data: aboutPage
    });
  } catch (error) {
    console.error('Error fetching about page for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch about page data',
      error: error.message
    });
  }
};

// ==================== CREATE/UPDATE ABOUT PAGE ====================
exports.createOrUpdateAboutPage = async (req, res) => {
  try {
    const { sections, descriptionBoxes, media, isPublished, heading, subheading, highlightTitle, highlightContent, description, ctaText, ctaPath, bottomMediaType } = req.body;

    // Validate required fields
    if (!sections && !descriptionBoxes && !media) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (sections, descriptionBoxes, or media) is required'
      });
    }

    // Get existing about page or create new one
    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (aboutPage) {
      // Update existing
      if (sections) aboutPage.sections = sections;
      if (descriptionBoxes) aboutPage.descriptionBoxes = descriptionBoxes;
      if (media) aboutPage.media = media;

      // Update static fields
      if (heading !== undefined) aboutPage.heading = heading;
      if (subheading !== undefined) aboutPage.subheading = subheading;
      if (highlightTitle !== undefined) aboutPage.highlightTitle = highlightTitle;
      if (highlightContent !== undefined) aboutPage.highlightContent = highlightContent;
      if (description !== undefined) aboutPage.description = description;
      if (ctaText !== undefined) aboutPage.ctaText = ctaText;
      if (ctaPath !== undefined) aboutPage.ctaPath = ctaPath;
      if (bottomMediaType !== undefined) aboutPage.bottomMediaType = bottomMediaType;

      if (typeof isPublished === 'boolean') {
        aboutPage.isPublished = isPublished;
        if (isPublished) {
          aboutPage.publishedAt = new Date();
        }
      }
      aboutPage.lastModifiedBy = req.user?._id || req.admin?._id;

      await aboutPage.save();
    } else {
      // Create new
      aboutPage = await AboutPage.create({
        heading: heading || '',
        subheading: subheading || '',
        highlightTitle: highlightTitle || '',
        highlightContent: highlightContent || '',
        description: description || '',
        ctaText: ctaText || 'Read More',
        ctaPath: ctaPath || '#',
        bottomMediaType: bottomMediaType || 'image',
        sections: sections || [],
        descriptionBoxes: descriptionBoxes || [],
        media: media || { images: [], videos: [] },
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
        lastModifiedBy: req.user?._id || req.admin?._id
      });
    }

    res.json({
      success: true,
      message: 'About page saved successfully',
      data: aboutPage
    });
  } catch (error) {
    console.error('Error saving about page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save about page',
      error: error.message
    });
  }
};

// ==================== ADD SECTION ====================
exports.addSection = async (req, res) => {
  try {
    const { type, content, title, order, heading, subheading, highlightedWord } = req.body;

    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      aboutPage = await AboutPage.create({
        sections: [],
        descriptionBoxes: [],
        media: { images: [], videos: [] }
      });
    }

    const newSection = {
      type: type || 'heading',
      content: content || '',
      heading: heading || '',
      subheading: subheading || '',
      highlightedWord: highlightedWord || '',
      title: title || undefined,
      order: order || aboutPage.sections.length,
      isActive: true
    };

    aboutPage.sections.push(newSection);
    await aboutPage.save();

    res.json({
      success: true,
      message: 'Section added successfully',
      data: aboutPage.sections[aboutPage.sections.length - 1]
    });
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add section',
      error: error.message
    });
  }
};

// ==================== UPDATE SECTION ====================
exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { type, content, title, order, isActive } = req.body;

    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    const section = aboutPage.sections.id(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    if (type) section.type = type;
    if (content) section.content = content;
    if (title !== undefined) section.title = title;
    if (order !== undefined) section.order = order;
    if (typeof isActive === 'boolean') section.isActive = isActive;

    await aboutPage.save();

    res.json({
      success: true,
      message: 'Section updated successfully',
      data: section
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update section',
      error: error.message
    });
  }
};

// ==================== DELETE SECTION ====================
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    aboutPage.sections.pull(sectionId);
    await aboutPage.save();

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete section',
      error: error.message
    });
  }
};

// ==================== ADD DESCRIPTION BOX ====================
exports.addDescriptionBox = async (req, res) => {
  try {
    const { type, title, content, order } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and content are required'
      });
    }

    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      aboutPage = await AboutPage.create({
        sections: [],
        descriptionBoxes: [],
        media: { images: [], videos: [] }
      });
    }

    const newBox = {
      type,
      title,
      content,
      order: order || aboutPage.descriptionBoxes.length,
      isActive: true
    };

    aboutPage.descriptionBoxes.push(newBox);
    await aboutPage.save();

    res.json({
      success: true,
      message: 'Description box added successfully',
      data: aboutPage.descriptionBoxes[aboutPage.descriptionBoxes.length - 1]
    });
  } catch (error) {
    console.error('Error adding description box:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add description box',
      error: error.message
    });
  }
};

// ==================== UPDATE DESCRIPTION BOX ====================
exports.updateDescriptionBox = async (req, res) => {
  try {
    const { boxId } = req.params;
    const { type, title, content, order, isActive } = req.body;

    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    const box = aboutPage.descriptionBoxes.id(boxId);

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Description box not found'
      });
    }

    if (type) box.type = type;
    if (title) box.title = title;
    if (content) box.content = content;
    if (order !== undefined) box.order = order;
    if (typeof isActive === 'boolean') box.isActive = isActive;

    await aboutPage.save();

    res.json({
      success: true,
      message: 'Description box updated successfully',
      data: box
    });
  } catch (error) {
    console.error('Error updating description box:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update description box',
      error: error.message
    });
  }
};

// ==================== DELETE DESCRIPTION BOX ====================
exports.deleteDescriptionBox = async (req, res) => {
  try {
    const { boxId } = req.params;

    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    aboutPage.descriptionBoxes.pull(boxId);
    await aboutPage.save();

    res.json({
      success: true,
      message: 'Description box deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting description box:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete description box',
      error: error.message
    });
  }
};

// ==================== UPLOAD IMAGE ====================
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { caption, order } = req.body;

    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 }) ||
      await AboutPage.create({
        sections: [],
        descriptionBoxes: [],
        media: { images: [], videos: [] }
      });

    if (aboutPage.media.images.length >= 4) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 images allowed'
      });
    }

    const imageData = {
      type: 'image',
      url: `/uploads/about/${req.file.filename}`,
      caption: caption || req.file.originalname,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      order: order || aboutPage.media.images.length,
      isActive: true
    };

    aboutPage.media.images.push(imageData);
    await aboutPage.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: aboutPage.media.images[aboutPage.media.images.length - 1]
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    // Clean up file if error occurs
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// ==================== ADD VIDEO ====================
exports.addVideo = async (req, res) => {
  try {
    const { url, title, platform } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Video URL is required'
      });
    }

    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      aboutPage = await AboutPage.create({
        sections: [],
        descriptionBoxes: [],
        media: { images: [], videos: [] }
      });
    }

    if (aboutPage.media.videos.length >= 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 videos allowed'
      });
    }

    // Convert YouTube URL to embed URL if needed
    let embedUrl = url;
    let detectedPlatform = platform;

    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      detectedPlatform = 'youtube';
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      detectedPlatform = 'youtube';
    } else if (url.includes('vimeo.com/')) {
      detectedPlatform = 'vimeo';
    }

    const videoData = {
      type: 'video',
      url: embedUrl,
      originalUrl: url,
      title: title || 'New Video',
      platform: detectedPlatform || 'other',
      order: aboutPage.media.videos.length,
      isActive: true
    };

    aboutPage.media.videos.push(videoData);
    await aboutPage.save();

    res.json({
      success: true,
      message: 'Video added successfully',
      data: aboutPage.media.videos[aboutPage.media.videos.length - 1]
    });
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add video',
      error: error.message
    });
  }
};

// ==================== DELETE IMAGE ====================
exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    const image = aboutPage.media.images.id(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete file from filesystem
    if (image.fileName) {
      const filePath = path.join(__dirname, '../../uploads/about', image.fileName);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    aboutPage.media.images.pull(imageId);
    await aboutPage.save();

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

// ==================== DELETE VIDEO ====================
exports.deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    aboutPage.media.videos.pull(videoId);
    await aboutPage.save();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message
    });
  }
};

// ==================== PUBLISH ABOUT PAGE ====================
exports.publishAboutPage = async (req, res) => {
  try {
    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    aboutPage.isPublished = true;
    aboutPage.publishedAt = new Date();
    await aboutPage.save();

    res.json({
      success: true,
      message: 'About page published successfully',
      data: aboutPage
    });
  } catch (error) {
    console.error('Error publishing about page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish about page',
      error: error.message
    });
  }
};

// ==================== CLEAR ALL DATA ====================
exports.clearAllData = async (req, res) => {
  try {
    const aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });

    if (!aboutPage) {
      return res.json({
        success: true,
        message: 'No data to clear'
      });
    }

    // Delete all image files
    for (const image of aboutPage.media.images) {
      if (image.fileName) {
        const filePath = path.join(__dirname, '../../uploads/about', image.fileName);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }

    // Clear all data
    aboutPage.sections = [];
    aboutPage.descriptionBoxes = [];
    aboutPage.media = { images: [], videos: [] };
    aboutPage.isPublished = false;
    aboutPage.publishedAt = null;

    await aboutPage.save();

    res.json({
      success: true,
      message: 'All data cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear data',
      error: error.message
    });
  }
};