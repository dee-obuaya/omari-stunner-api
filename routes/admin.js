const express = require('express');
const router = express.Router();

const Service = require('../models/service');
const ExpressError = require('./utils/ExpressError');
const handleAsync = require('./utils/handleAsync');


router.get('/dashboard', handleAsync(async(req, res) => {
    res.send({message: 'Omari Stunner Dashboard'});
}));