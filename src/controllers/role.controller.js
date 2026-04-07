const Role = require('../models/Role.model');
const { logActivity } = require('./activityLog.controller');

// Seed default roles on startup
exports.seedDefaultRoles = async () => {
  const defaults = [
    { name: 'Super Admin', description: 'Full access to all modules' },
    { name: 'Content Manager', description: 'Can manage content and media' },
    { name: 'Editor', description: 'Can edit content only' },
  ];
  for (const r of defaults) {
    const exists = await Role.findOne({ name: r.name });
    if (!exists) {
      await Role.create(r);
      console.log(`✅ Seeded role: ${r.name}`);
    }
  }
};

// GET all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE role
exports.createRole = async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const exists = await Role.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Role with this name already exists' });
    }

    const role = await Role.create({ name: name.trim(), description: description || '', createdBy });

    await logActivity(createdBy || 'Admin User', 'Created', 'Roles', `Created new role: ${name}`);

    res.status(201).json({ success: true, message: 'Role created successfully', data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, updatedBy } = req.body;

    const role = await Role.findByIdAndUpdate(
      id,
      { name: name?.trim(), description },
      { new: true }
    );

    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    await logActivity(updatedBy || 'Admin User', 'Updated', 'Roles', `Updated role: ${name}`);

    res.status(200).json({ success: true, message: 'Role updated successfully', data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.query.updatedBy || 'Admin User';

    const role = await Role.findByIdAndDelete(id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    await logActivity(updatedBy, 'Deleted', 'Roles', `Deleted role: ${role.name}`);

    res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
