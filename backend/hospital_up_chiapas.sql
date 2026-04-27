
CREATE DATABASE IF NOT EXISTS telesalud3;
USE telesalud3;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','DIRECTOR','MEDICO','LABORATORIO') NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nss VARCHAR(30) NOT NULL UNIQUE,
  nombres VARCHAR(100),
  primer_apellido VARCHAR(100),
  segundo_apellido VARCHAR(100),
  sexo VARCHAR(10),
  curp VARCHAR(20),
  fecha_nacimiento DATE,
  nacionalidad VARCHAR(50),
  estado_nacimiento VARCHAR(50),
  estado_residencia VARCHAR(50),
  municipio_residencia VARCHAR(100),
  localidad_residencia VARCHAR(100),
  estado_civil VARCHAR(20),
  domicilio VARCHAR(255),
  telefono VARCHAR(20),
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patientId INT,
  motivo_consulta VARCHAR(255),
  diagnostico VARCHAR(255),
  tratamiento VARCHAR(255),
  notas_clinicas TEXT,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (patientId) REFERENCES patients(id)
);

CREATE TABLE lab_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicalRecordId INT,
  type ENUM('Biometría hemática','Glucosa','Perfil lipídico','Uroanálisis'),
  status ENUM('PENDIENTE','EN_PROCESO','COMPLETADO'),
  objetivo_tratamiento VARCHAR(255),
  riesgos_tratamiento VARCHAR(255),
  consentimiento_informado TEXT,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (medicalRecordId) REFERENCES medical_records(id)
);

CREATE TABLE lab_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  labRequestId INT,
  result TEXT,
  file VARCHAR(255),
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (labRequestId) REFERENCES lab_requests(id)
);

INSERT INTO users (username, password, role, name, email, createdAt, updatedAt) VALUES
('admin',    '$2b$10$HZL4IM5bMLD0lrg1qI299OHyYfV.zjO2Od1GlkVWq5m2Uk8gfpQ8a', 'ADMIN',      'Administrador', 'admin@demo.com',    NOW(), NOW()),
('director', '$2b$10$zOm.eyBDK0MPz/ezKtJe/erJTKGCKisW04uGGroIyUe.m8v/wazyC', 'DIRECTOR',    'Director',      'director@demo.com', NOW(), NOW()),
('medico',   '$2b$10$H1TVdGllW/dIJPIhmUiuzuefjRgUKCCCU3lfF1XO1vm4UR3fLqpma', 'MEDICO',      'Medico',        'medico@demo.com',   NOW(), NOW()),
('lab',      '$2b$10$bSQWKA2uOxURf0Q8vTzycuS1hi3lWywekfInGrZdNDCd1h6IUbNne', 'LABORATORIO', 'Laboratorio',   'lab@demo.com',      NOW(), NOW());
