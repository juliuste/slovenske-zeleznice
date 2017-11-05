'use strict'

const soap = require('./soap')

const createStation = (s) => ({
    type: 'station',
    id: s[0].st,
    name: s[1].naziv
})

const stations = () =>
    soap.request('Postaje')
    .then((res) => res.PostajeResponse.PostajeResult.postaje)
    .then((res) => res.map((x) => createStation(x.postaja)))

module.exports = stations
