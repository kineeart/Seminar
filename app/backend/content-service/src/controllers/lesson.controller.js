const lessonService = require('../services/lesson.service');

async function listLessons(_req, res, next) {
  try {
    const lessons = await lessonService.listLessons();
    return res.status(200).json({ success: true, lessons });
  } catch (err) {
    return next(err);
  }
}

async function getLesson(req, res, next) {
  try {
    const lesson = await lessonService.getLesson(req.params.lessonId);
    return res.status(200).json({ success: true, lesson });
  } catch (err) {
    return next(err);
  }
}

async function createLesson(req, res, next) {
  try {
    const lesson = await lessonService.createLesson(req.body || {});
    return res.status(201).json({ success: true, lesson });
  } catch (err) {
    return next(err);
  }
}

async function updateLesson(req, res, next) {
  try {
    const lesson = await lessonService.updateLesson(req.params.lessonId, req.body || {});
    return res.status(200).json({ success: true, lesson });
  } catch (err) {
    return next(err);
  }
}

async function deleteLesson(req, res, next) {
  try {
    await lessonService.deleteLesson(req.params.lessonId);
    return res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
};
