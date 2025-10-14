const { Incident, User } = require('../models');
const transporter = require('../config/mailer');

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

exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.findAll();
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las incidencias.' });
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
    const { id } = req.params;
    const { asignado } = req.body;
    const incident = await Incident.findByPk(id);
    if (!incident) return res.status(404).json({ message: 'Incidencia no encontrada' });
    incident.asignado = asignado;
    await incident.save();
    res.json({ message: 'Asignado actualizado', incident });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar asignado', error });
  }
};

// Actualizar una incidencia completa (PUT /:id)
exports.updateIncident = async (req, res) => {
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
    res.status(500).json({ error: 'Error actualizando incidencia' });
  }
};

// Crear una incidencia
exports.createIncident = async (req, res) => {
  try {
    const { title, description, area, problemType } = req.body;
    const incident = await Incident.create({
      title,
      description,
      area,
      problemType,
      userId: req.user.id,
      status: 'abierto'
    });

    req.io?.emit('incident_created', incident);

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la incidencia' });
  }
};

exports.createIncidentWithImage = async (req, res) => {
  try {
    const { title, description, area, problemType } = req.body;
    const image_url = req.file ? req.file.path : null;

    const incident = await Incident.create({
      title,
      description,
      area,
      problemType: problemType || 'Informática',
      userId: req.user.id,
      status: 'abierto',
      image_url
    });

    // Enviar SIEMPRE a: rodrigo.zaldaña@netbees.es
    if (problemType === 'Informática') {
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: ['rodrigo.zaldana@netbees.es', 'diego.garcia@netbees.es'],
        subject: `Nueva incidencia creada: ${title}`,
        text: `Se ha creado una nueva incidencia en el área ${area}.\n\nDescripción: ${description}\n\nTipo: ${problemType}`
      }, (err, info) => {
        if (err) {
          console.error('Error enviando correo:', err);
        } else {
          console.log('Correo enviado:', info.response);
        }
      });
    }

    // Si es de Ingeniería, también enviar a:
    if (problemType === 'Ingeniería') {
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: ['hector.erquicia@maflow.com'],
        subject: `Nueva incidencia creada: ${title}`,
        text: `Se ha creado una nueva incidencia en el área ${area}.\n\nDescripción: ${description}\n\nTipo: ${problemType}`
      }, (err, info) => {
        if (err) {
          console.error('Error enviando correo:', err);
        } else {
          console.log('Correo enviado:', info.response);
        }
      });
    }

    req.io?.emit('incident_created', incident);

    res.status(201).json(incident);
  } catch (error) {
    console.error('Error en createIncidentWithImage:', error);
    res.status(500).json({ error: 'Error al crear la incidencia' });
  }
};

// Obtener incidencias del usuario autenticado
exports.getIncidents = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'user') {
      // Solo incidencias creadas por el usuario autenticado
      where.userId = req.user.id;
    } else if (req.user.role === 'admin_inf') {
      // Todas las incidencias de Informática
      where.problemType = 'Informática';
    } else if (req.user.role === 'admin_ing') {
      // Todas las incidencias de Ingeniería
      where.problemType = 'Ingeniería';
    }
    const incidents = await Incident.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor al obtener las incidencias.' });
  }
};
