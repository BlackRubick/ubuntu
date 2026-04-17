const { Patient, MedicalRecord, LabRequest } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.count();
    const totalStudies = await LabRequest.count();
    const studiesByType = await LabRequest.findAll({
      attributes: ['type', [require('sequelize').fn('COUNT', 'type'), 'count']],
      group: ['type'],
    });
    res.json({
      totalPatients,
      totalStudies,
      studiesByType,
    });
  } catch (err) {
    next(err);
  }
};
