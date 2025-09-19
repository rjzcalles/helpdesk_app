const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { createIncident, getIncidents, updateIncidentStatus } = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configuración: carpeta donde se guardan los archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardan las imágenes
  },
  filename: function (req, file, cb) {
    // Nombre único para cada archivo
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Ruta para crear incidencia con imagen opcional
router.post('/create-with-image', protect, upload.single('image'), incidentController.createIncidentWithImage);
router.route('/').post(protect, createIncident).get(protect, getIncidents);
router.put('/:id', protect, admin, incidentController.updateIncident);
router.patch('/:id/asignado', protect, incidentController.updateAsignado);
router.patch('/:id/status', protect, incidentController.updateStatus);
router.delete('/:id', protect, incidentController.deleteIncident);
router.get('/all', protect, admin, incidentController.getAllIncidents);

module.exports = router;