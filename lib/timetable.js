'use strict'

const isString = require('lodash.isstring')
const isDate = require('lodash.isdate')
const merge = require('lodash.merge')
const moment = require('moment')
require('moment-duration-format')
const momentTz = require('moment-timezone') // cheap hack for moment-duration-format fail

const soap = require('./soap')

const transformStops = (s, date) => {
    const stops = []
    let lastTime = 0
    for(let stop of s){
        const station = {
            type: 'station',
            id: stop.st_postaje,
            name: stop.postaja,
        }

        // format times
        if(stop.prihod.length > 0){
            const arrivalTime = +moment.duration(stop.prihod)
            if(arrivalTime < lastTime) date.add(1, 'days')
            station.arrival = moment.tz(date.format('DD.MM.YYYY')+' '+stop.prihod, 'DD.MM.YYYY HH:mm', 'Europe/Lisbon').toDate()
            lastTime = arrivalTime
        }
        if(stop.odhod.length > 0){
            const departureTime = +moment.duration(stop.odhod)
            if(departureTime < lastTime) date.add(1, 'days')
            station.departure = moment.tz(date.format('DD.MM.YYYY')+' '+stop.odhod, 'DD.MM.YYYY HH:mm', 'Europe/Lisbon').toDate()
            lastTime = departureTime
        }

        if(!station.arrival && station.departure){
            station.arrival = new Date(station.departure)
        }
        else if(station.arrival && !station.departure){
            station.departure = new Date(station.arrival)
        }
        else if(!station.arrival && !station.departure){
            throw new Error('departure must have either departure or arrival time')
        }

        stops.push(station)
    }
    return stops
}

const timetable = (trainNumber, origin, destination, date = new Date()) => {
    if(!isString(trainNumber) || trainNumber.length <= 0) throw new Error('invalid or missing trainNumber')

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

    return soap.request('Postaje_vlaka', {
        vl: trainNumber,
        da: formattedDate,
        p_OD: origin,
        p_DO: destination
    })
    .then((res) => res.Postaje_vlakaResponse.Postaje_vlakaResult.postaje_vlaka.vlak)
    .then((res) => res ? res.map((x) => merge(...x.postanek)) : null)
    .then((res) => res ? transformStops(res, date) : null)
}

module.exports = timetable
