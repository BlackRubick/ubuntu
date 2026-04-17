-- MySQL Script para telesalud
CREATE DATABASE IF NOT EXISTS telesalud;
USE telesalud;

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
  name VARCHAR(100),
  age INT,
  sex VARCHAR(10),
  address VARCHAR(255),
  phone VARCHAR(20),
  nss VARCHAR(20),
  marital_status VARCHAR(20),
  admission_date DATE,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patientId INT,
  reason VARCHAR(255),
  diagnosis VARCHAR(255),
  treatment VARCHAR(255),
  notes TEXT,
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
