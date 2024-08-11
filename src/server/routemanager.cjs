const express = require('express');

function sertup(app) {
    app.set('views', __dirname + '/../base/routes');
    app.set('view engine', 'ejs');
}

module.exports = {sertup};