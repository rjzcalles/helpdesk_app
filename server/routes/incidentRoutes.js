const express = require('express');
const router = express.Router();
const { createIncident, getIncidents, getAllIncidents, updateIncidentStatus } = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/').post(protect, createIncident).get(protect, getIncidents);
router.get('/all', protect, admin, getAllIncidents);
router.put('/:id', protect, admin, updateIncidentStatus);

module.exports = router;