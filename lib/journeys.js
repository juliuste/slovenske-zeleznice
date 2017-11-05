'use strict'

const isString = require('lodash.isstring')
const isDate = require('lodash.isdate')
const isNumber = require('lodash.isnumber')
const merge = require('lodash.merge')
const moment = require('moment')
require('moment-duration-format')
const momentTz = require('moment-timezone') // cheap hack for moment-duration-format fail

const soap = require('./soap')

const hashLeg = (l) => l.origin.id+'@'+l.departure.toISOString()+'@'+l.destination.id+'@'+l.arrival.toISOString()+'@'+l.trainNumber+'@'+l.product
const hashJourney = (legs) => legs.map(hashLeg).join('-')

const createStation = (id, name) => ({
    type: 'station',
    id,
    name
})

const createJourney = (j, date) => {
    const journey = {type: 'journey'}

    // price
    const price = j.find((x) => !!x.price && isNumber(+x.price) && +x.price > 0)
    journey.price = price ? {
        amount: +price.price,
        currency: 'EUR'
    } : null

    // info
    const info = j.find((x) => !!x.obdobje && isString(x.obdobje) && x.obdobje.length > 0)
    journey.info = info ? info.obdobje : null

    // legs
    const preLegs = j.filter((x) => x.train && Array.isArray(x.train) && x.train.length > 0).map((x) => x.train).map((x) => merge(...x))
    const legs = []
    let lastTime = 0
    for(let preLeg of preLegs){
        const leg = {
            mode: 'train', // todo
            public: true,
            operator: {
                type: 'operator',
                id: 'sž',
                name: 'Slovenske železnice',
                url: 'http://www.slo-zeleznice.si'
            },
            trainNumber: preLeg.vlak || null,
            product: preLeg.vrsta || null
        }

        // todo: grupa, mzap, obstacle, delay, ovira_id

        // bicycle
        if(preLeg.allowBicycle === 'true') leg.bicycle = true
        else if(preLeg.allowBicycle === 'false') leg.bicycle = false

        // wifi
        if(preLeg.WiFi === 'true') leg.wifi = true
        else if(preLeg.WiFi === 'false') leg.wifi = false

        // departure
        preLeg.departure = merge(...preLeg.departure)
        const departureTime = +moment.duration(preLeg.departure.time)
        if(departureTime < lastTime) date.add(1, 'days')
        leg.departure = moment.tz(date.format('DD.MM.YYYY')+' '+preLeg.departure.time, 'DD.MM.YYYY HH:mm', 'Europe/Ljubljana').toDate()
        lastTime = departureTime

        // arrival
        preLeg.arrival = merge(...preLeg.arrival)
        const arrivalTime = +moment.duration(preLeg.arrival.time)
        if(arrivalTime < lastTime) date.add(1, 'days')
        leg.arrival = moment.tz(date.format('DD.MM.YYYY')+' '+preLeg.arrival.time, 'DD.MM.YYYY HH:mm', 'Europe/Ljubljana').toDate()
        lastTime = arrivalTime

        // origin
        leg.origin = createStation(preLeg.departure.st_postaje, preLeg.departure.station)

        // destination
        leg.destination = createStation(preLeg.arrival.st_postaje, preLeg.arrival.station)

        legs.push(leg)
    }

    journey.id = hashJourney(legs)
    journey.legs = legs

    return journey
}

const journeys = (origin, destination, date = new Date()) => {
    if(isString(origin)) origin = {id: origin, type: 'station'}
    if(!isString(origin.id)) throw new Error('invalid or missing origin id')
    if(origin.type !== 'station') throw new Error('invalid or missing origin type')
    origin = origin.id

    if(isString(destination)) destination = {id: destination, type: 'station'}
    if(!isString(destination.id)) throw new Error('invalid or missing destination id')
    if(destination.type !== 'station') throw new Error('invalid or missing destination type')
    destination = destination.id

    if(!isDate(date)){
        throw new Error('invalid `date` parameter')
    }
    date = momentTz.tz(date, 'Europe/Ljubljana')
    const formattedDate = date.format('YYYY-MM-DD')

    return soap.request('Iskalnik_mob', {
        iz: origin,
        vs: destination,
        vi: '', // todo, probably 'via'
        da: formattedDate
    })
    .then((res) => res.Iskalnik_mobResponse.Iskalnik_mobResult.results)
    .then((res) => res ? res.map((x) => createJourney(x.connection, date)) : [])
}

module.exports = journeys
