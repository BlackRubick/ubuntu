const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// User model
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.ENUM('ADMIN', 'DIRECTOR', 'MEDICO', 'LABORATORIO'),
    allowNull: false,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
}, {
  tableName: 'users',
  timestamps: true,
});

// Patient model actualizado
const Patient = sequelize.define('Patient', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nss: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  nombres: Sequelize.STRING,
  primer_apellido: Sequelize.STRING,
  segundo_apellido: Sequelize.STRING,
  sexo: Sequelize.STRING,
  curp: Sequelize.STRING,
  fecha_nacimiento: Sequelize.DATE,
  nacionalidad: Sequelize.STRING,
  estado_nacimiento: Sequelize.STRING,
  estado_residencia: Sequelize.STRING,
  municipio_residencia: Sequelize.STRING,
  localidad_residencia: Sequelize.STRING,
  estado_civil: Sequelize.STRING,
  domicilio: Sequelize.STRING,
  telefono: Sequelize.STRING,
}, {
  tableName: 'patients',
  timestamps: true,
});

// Medical Record model actualizado
const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  patientId: Sequelize.INTEGER,
  motivo_consulta: Sequelize.STRING,
  diagnostico: Sequelize.STRING,
  tratamiento: Sequelize.STRING,
  notas_clinicas: Sequelize.TEXT,
}, {
  tableName: 'medical_records',
  timestamps: true,
});

// Lab Request model
const LabRequest = sequelize.define('LabRequest', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: Sequelize.ENUM('Biometría hemática', 'Glucosa', 'Perfil lipídico', 'Uroanálisis'),
  status: Sequelize.ENUM('PENDIENTE', 'EN_PROCESO', 'COMPLETADO'),
  objetivo_tratamiento: Sequelize.STRING,
  riesgos_tratamiento: Sequelize.STRING,
  consentimiento_informado: Sequelize.TEXT,
}, {
  tableName: 'lab_requests',
  timestamps: true,
});

// Lab Result model
const LabResult = sequelize.define('LabResult', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  result: Sequelize.TEXT,
  file: Sequelize.STRING, // path to result file if needed
}, {
  tableName: 'lab_results',
  timestamps: true,
});


// Associations
Patient.hasMany(MedicalRecord, { foreignKey: 'patientId', onDelete: 'CASCADE', hooks: true });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });

MedicalRecord.hasMany(LabRequest, { foreignKey: 'medicalRecordId' });
LabRequest.belongsTo(MedicalRecord, { foreignKey: 'medicalRecordId' });

LabRequest.hasOne(LabResult, { foreignKey: 'labRequestId' });
LabResult.belongsTo(LabRequest, { foreignKey: 'labRequestId' });

module.exports = {
  sequelize,
  User,
  Patient,
  MedicalRecord,
  LabRequest,
  LabResult,
};
