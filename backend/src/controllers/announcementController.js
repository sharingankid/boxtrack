const announcementService = require('../services/announcementService');

async function listPublic(req, res, next) {
  try {
    res.status(200).json({ announcements: await announcementService.listPublic() });
  } catch (err) {
    next(err);
  }
}

async function listAll(req, res, next) {
  try {
    res.status(200).json({ announcements: await announcementService.listAll() });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const announcement = await announcementService.create(req.body, req.user.id);
    res.status(201).json({ announcement });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const announcement = await announcementService.update(req.params.id, req.body);
    res.status(200).json({ announcement });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await announcementService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublic, listAll, create, update, remove };
