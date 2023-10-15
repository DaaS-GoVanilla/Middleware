const express = require('express');
const functionHandlers = require('./functions');

const router = express.Router();

router.post('/create', functionHandlers.handleCreate);
router.put('/update/:id', functionHandlers.handleUpdate);
router.delete('/delete/:id', functionHandlers.handleDelete);

module.exports = router;