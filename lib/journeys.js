'use strict'

const { journeys: validateArguments } = require('fpti-util').validateMethodArguments
const { DateTime } = require('luxon')
const merge = require('lodash/merge')
const take = require('lodash/take')

const soap = require('./soap')
const { createStation, parseDate, parseBoolean, toArray } = require('./helpers')

const operator = {
	type: 'operator',
	id: 'sž',
	name: 'Slovenske železnice',
	url: 'http://www.slo-zeleznice.si'
}

const hashJourney = legs => legs.map(leg => leg.id).join('-')

const createJourney = (j) => {
	const legs = toArray(j.train).map(rawLeg => {
		// todo: grupa, mzap, obstacle, delay, ovira_id
		const leg = {
			origin: createStation(rawLeg.departure),
			destination: createStation(rawLeg.arrival),
			departure: parseDate(rawLeg.departure),
			arrival: parseDate(rawLeg.arrival),
			mode: 'train', // todo
			public: true,
			line: {
				type: 'line',
				id: rawLeg.vlak + '',
				name: [rawLeg.vrsta, rawLeg.vlak].join(' '),
				number: rawLeg.vlak + '',
				product: rawLeg.vrsta + '',
				mode: ((rawLeg.vrsta + '').toLowerCase() === 'bus') ? 'bus' : 'train', // @todo
				public: true,
				operator
			},
			operator,
			bicycle: parseBoolean(rawLeg.allowBicycle),
			wifi: parseBoolean(rawLeg.WiFi)
		}
		leg.id = [leg.line.id, DateTime.fromISO(leg.departure).toFormat('yyyy-MM-dd'), leg.origin.id, leg.destination.id].join('###')
		return leg
	})

	const journey = {
		type: 'journey',
		id: hashJourney(legs),
		info: j.obdobje ? (j.obdobje.obdobje_ang || j.obdobje.value || null) : null,
		legs
	}

	if (!Number.isNaN(+j.price) && +j.price > 0) {
		journey.price = {
			amount: +j.price,
			currency: 'EUR'
		}
	}

	return journey
}

const fetchJourneysForDate = async (origin, destination, options, date) => {
	const day = DateTime.fromJSDate(date, { zone: 'Europe/Ljubljana' }).toFormat('yyyy-MM-dd')
	const response = await soap.request('Iskalnik_mob', {
		vs: origin,
		iz: destination,
		vi: '', // @todo, probably 'via'
		da: day
	})
	const rawJourneys = toArray(response.Iskalnik_mobResponse.Iskalnik_mobResult.results.connection)
	return rawJourneys.map(createJourney)
}

const defaults = () => ({
	// fpti options
	when: null,
	departureAfter: null,
	results: null,
	transfers: null,
	interval: null
})

const journeys = async (origin, destination, opt = {}) => {
	// merge options with defaults
	const def = defaults()
	if (!(opt.departureAfter || opt.when)) def.departureAfter = new Date()
	const options = merge({}, def, opt)

	// validate arguments, prepare origin and destination
	if (typeof origin !== 'string') origin = { ...origin, name: 'dummy' }
	if (typeof destination !== 'string') destination = { ...destination, name: 'dummy' }
	validateArguments(origin, destination, options)
	if (typeof origin !== 'string') origin = origin.id
	if (typeof destination !== 'string') destination = destination.id

	const date = options.when || options.departureAfter
	const endDate = DateTime.fromJSDate(date).plus({ minutes: options.interval || 0 }).toJSDate()

	let endDateReached = !options.interval || false
	let currentDate = date
	let journeys = []
	do {
		const newJourneys = await fetchJourneysForDate(origin, destination, options, currentDate)
		journeys.push(...newJourneys)

		currentDate = DateTime.fromJSDate(currentDate, { zone: 'Europe/Ljubljana' }).plus({ days: 1 }).startOf('day').toJSDate()
		endDateReached = !options.interval || (+currentDate > +endDate)
	} while (!endDateReached)

	journeys = journeys.filter(j => +new Date(j.legs[0].departure) >= +date)
	if (typeof options.interval === 'number') journeys = journeys.filter(j => +new Date(j.legs[0].departure) <= +endDate)
	if (typeof options.transfers === 'number') journeys = journeys.filter(j => j.legs.length <= options.transfers + 1)
	if (typeof options.results === 'number') journeys = take(journeys, options.results)
	return journeys
}
journeys.features = { // required by fpti
	when: 'Journey date, synonym to departureAfter',
	departureAfter: 'List journeys with a departure (first leg) after this date',
	results: 'Max. number of results returned',
	transfers: 'Max. number of transfers',
	interval: 'Results for how many minutes after / before when (depending on whenRepresents)'
}

module.exports = journeys
