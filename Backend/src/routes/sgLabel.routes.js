const express = require('express');
const router = express.Router();
const sgLabelController = require('../controllers/sgLabel.controller');
const { auth } = require('../middleware/auth.middleware');
const checkAbility = require('../middleware/checkAbility');

router.get('/', auth, checkAbility('read', 'sg-label'), sgLabelController.getSgLabels);
router.get('/:id', auth, checkAbility('read', 'sg-label'), sgLabelController.getSgLabelById);
router.post('/pdf', auth, checkAbility('read', 'sg-label'), sgLabelController.generateSgLabelPdf);
router.post('/', auth, checkAbility('create', 'sg-label'), sgLabelController.createSgLabel);
router.put('/:id', auth, checkAbility('edit', 'sg-label'), sgLabelController.updateSgLabel);
router.put('/:id/status', auth, checkAbility('edit', 'sg-label'), sgLabelController.toggleStatus);
router.put('/:id/hide', auth, checkAbility('delete', 'sg-label'), sgLabelController.hideVariantFromSgLabel);
router.delete('/:id', auth, checkAbility('delete', 'sg-label'), sgLabelController.deleteSgLabel);

module.exports = router;
