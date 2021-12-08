const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCrtl = require('../controllers/sauce');


router.get('/', auth, sauceCrtl.getAllSauces);
router.get('/:id', auth, sauceCrtl.getOneSauce);
router.post('/', auth, multer, sauceCrtl.createSauce);
router.put('/:id', auth, multer, sauceCrtl.modifySauce);
router.delete('/:id', auth, sauceCrtl.deleteSauce);





module.exports = router;