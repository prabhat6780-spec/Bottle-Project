const express = require('express');
const router = express.Router();
const sgLabelTwoController = require('../controllers/sgLabelTwoController');
const { auth } = require('../middleware/auth.middleware');
const checkAbility = require('../middleware/checkAbility');

router.use(auth);

// Template routes
router.post('/pdf', auth, checkAbility('read', 'sg-label-2'), sgLabelTwoController.generatePdf);
router.post('/', auth, checkAbility('create', 'sg-label-2'), sgLabelTwoController.createTemplate);
router.get('/', auth, checkAbility('read', 'sg-label-2'), sgLabelTwoController.getTemplates);
router.get('/:id', auth, checkAbility('read', 'sg-label-2'), sgLabelTwoController.getTemplate);
router.put('/:id', auth, checkAbility('edit', 'sg-label-2'), sgLabelTwoController.updateTemplate);
router.delete('/:id', auth, checkAbility('delete', 'sg-label-2'), sgLabelTwoController.deleteTemplate);
router.patch('/:id/toggle-status', auth, checkAbility('edit', 'sg-label-2'), sgLabelTwoController.toggleTemplateStatus);

module.exports = router;
