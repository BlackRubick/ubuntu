const { LabRequest, MedicalRecord, LabResult } = require('../models');

exports.createLabRequest = async (req, res, next) => {
  try {
    const {
      medicalRecordId,
      type,
      objetivo_tratamiento,
      riesgos_tratamiento,
      consentimiento_informado
    } = req.body;
    const request = await LabRequest.create({
      medicalRecordId,
      type,
      status: 'PENDIENTE',
      objetivo_tratamiento,
      riesgos_tratamiento,
      consentimiento_informado
    });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
};

exports.getLabRequests = async (req, res, next) => {
  try {
    const requests = await LabRequest.findAll({
      include: [
        {
          model: MedicalRecord,
          include: ['Patient']
        },
        LabResult
      ]
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

exports.updateLabRequestStatus = async (req, res, next) => {
  try {
    const request = await LabRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    request.status = req.body.status;
    await request.save();
    res.json(request);
  } catch (err) {
    next(err);
  }
};
