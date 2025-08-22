const { Incident, User } = require('../models');

exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.findAll({
      include: [{
        model: User,
        attributes: ['firstName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

exports.updateIncidentStatus = async (req, res) => {
  try {
    if (incident) {
      incident.status = status;
      await incident.save();

      req.io.emit('incident_updated', incident);

      res.status(200).json(incident);
    } else { /* ... */ }
  } catch (error) { /* ... */ }
};

exports.createIncident = async (req, res) => {
  try {
    const { title, description, area } = req.body; // <-- Añadir area
    const userId = req.user.id;

    const newIncident = await Incident.create({
      title,
      description,
      status: 'abierto',
      userId,
      area, // <-- Guardar el area
    });

    req.io.emit('incident_created', incidentWithOwner);

    res.status(201).json(incidentWithOwner);
  } catch (error) { /* ... */ }
};

exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.findAll({ where: { userId: req.user.id } });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener las incidencias.' });
  }
};