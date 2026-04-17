require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { User } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });
  const adminHash = await bcrypt.hash('admin123', 10);
  const directorHash = await bcrypt.hash('director123', 10);
  const medicoHash = await bcrypt.hash('medico123', 10);
  const labHash = await bcrypt.hash('lab123', 10);

  await User.create({
    username: 'admin',
    password: adminHash,
    role: 'ADMIN',
    name: 'Administrador',
    email: 'admin@hospital.com',
  });
  await User.create({
    username: 'director',
    password: directorHash,
    role: 'DIRECTOR',
    name: 'Director General',
    email: 'director@hospital.com',
  });
  await User.create({
    username: 'medico',
    password: medicoHash,
    role: 'MEDICO',
    name: 'Dr. Juan Pérez',
    email: 'medico@hospital.com',
  });
  await User.create({
    username: 'laboratorio',
    password: labHash,
    role: 'LABORATORIO',
    name: 'Lab. Central',
    email: 'lab@hospital.com',
  });
  console.log('Usuarios de prueba insertados: admin, director, medico, laboratorio');
  process.exit();
}

seed();
