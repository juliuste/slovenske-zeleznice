'use strict'

const intoStream = require('into-stream').object
const soap = require('./soap')

const createStation = (s) => ({
	type: 'station',
	id: s.st,
	name: s.naziv
})

const allAsync = async (opt) => {
	const response = await soap.request('Postaje')
	return response.PostajeResponse.PostajeResult.postaje.postaja.map(createStation)
}

const all = (opt = {}) => {
	return intoStream(allAsync(opt))
}
all.features = {} // required by fpti

module.exports = { all }
