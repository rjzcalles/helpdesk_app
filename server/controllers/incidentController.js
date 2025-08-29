const { Incident, User } = require('../models');
const transporter = require('../config/mailer');

// Obtener todas las incidencias (admin)
exports.getAllIncidents = async (req, res) => {
  try {
    let incidents;
    if (req.user.role === 'user') {
      incidents = await Incident.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
    } else {
      incidents = await Incident.findAll({
        order: [['createdAt', 'DESC']]
      });
    }
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener incidencias' });
  }
};

// Actualizar solo el estado de una incidencia (PATCH /:id/status)
exports.updateStatus = async (req, res) => {
  try {
    const { status, asignado } = req.body;
    const incident = await Incident.findByPk(req.params.id, { include: User });
    if (!incident) return res.status(404).json({ error: 'No encontrado' });
    if (typeof status !== 'undefined') incident.status = status;
    if (typeof asignado !== 'undefined') incident.asignado = asignado;
    await incident.save();

    // Enviar correo si el estado es "cerrado"
    if (status === 'cerrado' && incident.User?.email) {
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: incident.User.email,
        subject: `Tu incidencia ha sido cerrada`,
        text: `La incidencia "${incident.title}" en el área "${incident.area}" ha sido cerrada.`
      }, (err, info) => {
        if (err) {
          console.error('Error enviando correo:', err);
        } else {
          console.log('Correo enviado:', info.response);
        }
      });
    }

    req.io?.emit('incident_updated', incident);

    res.json(incident);
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
    const incident = await Incident.create({
      title,
      description,
      area,
      userId: req.user.id,
      status: 'abierto'
    });

    // Enviar correo a ambos destinatarios
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: ['marcosgomezpalazuelo1@gmail.com', 'zaldana@netbees.es'],
      subject: `Nueva incidencia creada: ${title}`,
      text: `Se ha creado una nueva incidencia en el área ${area}.\n\nDescripción: ${description}`
    }, (err, info) => {
      if (err) {
        console.error('Error enviando correo:', err);
      } else {
        console.log('Correo enviado:', info.response);
      }
    });

    req.io?.emit('incident_created', incident);

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la incidencia' });
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