const { LabResult, LabRequest } = require('../models');

exports.createLabResult = async (req, res, next) => {
  try {
    const { labRequestId, result } = req.body;
    let filePath = null;
    if (req.file) {
      // Guardar la ruta relativa para servir el archivo
      filePath = `/uploads/results/${req.file.filename}`;
    }
    const labResult = await LabResult.create({ labRequestId, result, file: filePath });
    await LabRequest.update({ status: 'COMPLETADO' }, { where: { id: labRequestId } });
    res.status(201).json(labResult);
  } catch (err) {
    next(err);
  }
};

exports.getLabResults = async (req, res, next) => {
  try {
    const results = await LabResult.findAll({
      include: [{
        model: LabRequest,
        include: [{
          model: require('../models').MedicalRecord,
          include: [require('../models').Patient]
        }]
      }]
    });
    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getLabResult = async (req, res, next) => {
  try {
    const result = await LabResult.findByPk(req.params.id, { include: LabRequest });
    if (!result) return res.status(404).json({ message: 'Resultado no encontrado' });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
