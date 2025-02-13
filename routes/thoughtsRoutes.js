const express = require('express')

const router = express.Router()

// Importando meu controller
const ThoughtController = require('../controllers/ThoughtController')

// Importando meu helper
const checkAuth = require('../helpers/auth').checkAuth

router.get('/dashboard', checkAuth, ThoughtController.dashboard) // O middleware será executado sempre que a rota for acessada.
router.get('/add', checkAuth, ThoughtController.createThought)
router.post('/add', checkAuth, ThoughtController.createThoughtSave)
router.post('/delete', checkAuth, ThoughtController.deleteThought)
router.get('/', ThoughtController.showThoughts)
router.get('/edit/:id', ThoughtController.editThought)
router.post('/edit', ThoughtController.editThoughtUpdate)

module.exports = router