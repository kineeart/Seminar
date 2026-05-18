const express = require('express');
const controller = require('../controllers/lesson.controller');

const router = express.Router();

router.get('/', controller.listLessons);
router.post('/', controller.createLesson);
router.get('/:lessonId', controller.getLesson);
router.patch('/:lessonId', controller.updateLesson);
router.delete('/:lessonId', controller.deleteLesson);

module.exports = router;
