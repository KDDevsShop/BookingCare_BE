const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialtyController');
const upload = require('../configs/multerConfig');

router.post(
  '/',
  upload.single('specialtyImage'),
  specialtyController.createSpecialty
);
router.get('/', specialtyController.getAllSpecialties);
router.get('/:id', specialtyController.getSpecialtyById);
router.put(
  '/:id',
  upload.single('specialtyImage'),
  specialtyController.updateSpecialty
);
router.delete('/:id', specialtyController.deleteSpecialty);

module.exports = router;
