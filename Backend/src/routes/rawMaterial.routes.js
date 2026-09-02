const express = require('express');
const router = express.Router();
const rawMaterialController = require('../controllers/rawMaterial.controller');

router.post('/', rawMaterialController.createRawMaterial);
router.get('/', rawMaterialController.getRawMaterials);
router.get('/:id', rawMaterialController.getRawMaterialById);
router.put('/:id', rawMaterialController.updateRawMaterial);
router.delete('/:id', rawMaterialController.deleteRawMaterial);

module.exports = router;
