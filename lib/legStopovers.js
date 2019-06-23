'use strict'

const { DateTime } = require('luxon')
const isString = require('lodash/isString')

const soap = require('./soap')
const { createStation, parseDate, toArray } = require('./helpers')

const transformStopovers = (sts, baseDate) => {
	const stopovers = []
	let lastDate = null
	sts.forEach(st => {
		const stopover = {
			type: 'stopover',
			stop: createStation(st),
			departure: null,
			arrival: null
		}

		// arrival
		if (st.prihod) {
			let provisionalArrival = parseDate({ date: baseDate, time: st.prihod })
			if (lastDate && (+new Date(provisionalArrival) < +new Date(lastDate))) {
				baseDate = DateTime.fromISO(baseDate, { zone: 'Europe/Ljubljana' }).plus({ days: 1 }).toISO()
				provisionalArrival = parseDate({ date: baseDate, time: st.prihod })
			}
			stopover.arrival = provisionalArrival
			lastDate = provisionalArrival
		}

		// departure
		if (st.odhod) {
			let provisionalDeparture = parseDate({ date: baseDate, time: st.odhod })
			if (lastDate && (+new Date(provisionalDeparture) < +new Date(lastDate))) {
				baseDate = DateTime.fromISO(baseDate, { zone: 'Europe/Ljubljana' }).plus({ days: 1 }).toISO()
				provisionalDeparture = parseDate({ date: baseDate, time: st.odhod })
			}
			stopover.departure = provisionalDeparture
			lastDate = provisionalDeparture
		}

		stopovers.push(stopover)
	})

	return stopovers
}

const legStopovers = async (legId) => {
	if (!isString(legId) || legId.length === 0) throw new Error('invalid or missing `legId`, must be string')
	const [lineId, day, origin, destination] = legId.split('###') // @todo

	if (!isString(lineId) || lineId.length === 0) throw new Error('invalid `legId`')
	if (!isString(origin) || origin.length === 0) throw new Error('invalid `legId`')
	if (!isString(destination) || destination.length === 0) throw new Error('invalid `legId`')
	if (!isString(day) || day.length !== 10) throw new Error('invalid `legId`')

	const response = await soap.request('Postaje_vlaka', {
		vl: lineId,
		da: day,
		p_OD: origin,
		p_DO: destination
	})

	const baseDate = response.Postaje_vlakaResponse.Postaje_vlakaResult.postaje_vlaka.vlak.datum
	const rawStopovers = toArray(response.Postaje_vlakaResponse.Postaje_vlakaResult.postaje_vlaka.vlak.postanek)
	return transformStopovers(rawStopovers, baseDate)
}
legStopovers.features = {} // required by fpti

module.exports = legStopovers
