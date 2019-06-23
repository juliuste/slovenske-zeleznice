'use strict'

const createSoapClient = require('easysoap')
const merge = require('lodash/merge')

const endpoint = {
	host: '91.209.49.139',
	path: '/webse/se.asmx',
	wsdl: '/webse/se.asmx?WSDL'
}

const options = {
	secure: false // sigh…
}

const client = () => createSoapClient(endpoint, options)

const call = (client, method, params = {}) =>
	client.call({
		method: method,
		attributes: {
			xmlns: 'http://www.slo-zeleznice.si/'
		},
		params: merge({
			username: 'zeljko',
			password: 'joksimovic'
		}, params)
	})
		.then(({ data }) => data)

const request = (method, params = {}) => call(client(), method, params)

const toArray = entity => {
	if (!entity) return []
	if (Array.isArray(entity)) return entity
	return [entity]
}

module.exports = { client, call, request, toArray }
