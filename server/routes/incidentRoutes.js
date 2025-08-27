const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { createIncident, getIncidents, getAllIncidents, updateIncidentStatus } = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/').post(protect, createIncident).get(protect, getIncidents);
router.get('/all', protect, admin, getAllIncidents);
router.put('/:id', protect, admin, updateIncidentStatus, incidentController.updateStatus);
router.patch('/:id/status', protect, incidentController.updateStatus);
router.delete('/:id', protect, incidentController.deleteIncident);

module.exports = router;