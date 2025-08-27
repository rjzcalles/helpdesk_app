const { Incident, User } = require('../models');

// Obtener todas las incidencias (admin)
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

// Actualizar solo el estado de una incidencia (PATCH /:id/status)
exports.updateStatus = async (req, res) => {
  try {
    const { status, asignado } = req.body;
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'No encontrado' });
    if (typeof status !== 'undefined') incident.status = status;
    if (typeof asignado !== 'undefined') incident.asignado = asignado;
    await incident.save();
    res.json({
      status: incident.status,
      asignado: incident.asignado,
      updatedAt: incident.updatedAt
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
};

exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'No encontrado' });
    await incident.destroy();
    res.json({ message: 'Incidencia eliminada correctamente' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error eliminando incidencia' });
  }
};

exports.updateAsignado = async (req, res) => {
  try {
    const { asignado } = req.body;
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ error: 'No encontrado' });
    incident.asignado = asignado;
    await incident.save();
    res.json({
      asignado: incident.asignado,
      updatedAt: incident.updatedAt
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando asignado' });
  }
};

// Actualizar una incidencia completa (PUT /:id)
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const incident = await Incident.findByPk(req.params.id);
    if (incident) {
      incident.status = status;
      await incident.save();

      req.io?.emit('incident_updated', incident);

      res.status(200).json(incident);
    } else {
      res.status(404).json({ message: 'Incidencia no encontrada.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la incidencia.' });
  }
};

// Crear una incidencia
exports.createIncident = async (req, res) => {
  try {
    const { title, description, area } = req.body;
    const userId = req.user.id;

    const newIncident = await Incident.create({
      title,
      description,
      status: 'abierto',
      userId,
      area,
    });

    // Buscar el usuario para incluir sus datos en el emit
    const user = await User.findByPk(userId, {
      attributes: ['firstName', 'email']
    });

    const incidentWithOwner = {
      ...newIncident.toJSON(),
      User: user
    };

    req.io?.emit('incident_created', incidentWithOwner);

    res.status(201).json(incidentWithOwner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la incidencia.' });
  }
};

// Obtener incidencias del usuario autenticado
exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.findAll({ where: { userId: req.user.id } });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener las incidencias.' });
  }
};