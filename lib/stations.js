'use strict'

const soap = require('./soap')

const createStation = (s) => ({
	type: 'station',
	id: s.st,
	name: s.naziv
})

const stations = () =>
	soap.request('Postaje')
		.then(res => res.PostajeResponse.PostajeResult.postaje.postaja)
		.then(res => res.map(createStation))

module.exports = stations
