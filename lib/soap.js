'use strict'

const soap = require('easysoap')
const merge = require('lodash.merge')

const client = () => soap.createClient({
    host: '91.209.49.139',
    path: '/webse/se.asmx',
    wsdl: '/webse/se.asmx?WSDL',
    secure: false // sigh…
})

const call = (client, method, params = {}) =>
    client.call({
        method: method,
        attributes: {
            xmlns: 'http://www.slo-zeleznice.si/'
        },
        params: merge({
            username: 'zeljko',
            password: 'joksimovic'
        }, params)
    })
    .then((res) => res.data)

const request = (method, params = {}) => call(client(), method, params)

module.exports = {client, call, request}
