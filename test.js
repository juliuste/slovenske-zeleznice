
const tape = require('tape')
const sz = require('.')
const isString = require('lodash.isstring')
const isNumber = require('lodash.isnumber')
const isDate = require('lodash.isdate')
const isObject = require('lodash.isobject')
const moment = require('moment-timezone')

const isStation = (s) => s.type === 'station' && isString(s.id) && s.id.length > 4 && isString(s.name) && s.name.length > 1 // && isNumber(s.coordinates.longitude) && isNumber(s.coordinates.latitude)
const isTrainStop = (s) => isStation(s) && isDate(s.arrival) && isDate(s.departure) && +s.departure >= +s.arrival

const isSZ = (o) => o.type === 'operator' && o.id === 'sž' && o.name === 'Slovenske železnice' && o.url === 'http://www.slo-zeleznice.si'

tape('sz', async (t) => {
	// stations
	const stations = await sz.stations()
	t.ok(stations.length > 20, 'stations length')
	const ljubljana = stations.find((x) => x.name.indexOf('Ljubljana') >= 0)
	t.ok(ljubljana.type === 'station', 'station type')
	t.ok(isString(ljubljana.id) && ljubljana.id.length > 4, 'station id')
	t.ok(isString(ljubljana.name) && ljubljana.name.length > 4, 'station name')

	const date = moment.tz('Europe/Ljubljana').add(3, 'days').toDate()

	// journeys
	const maribor = stations.find((x) => x.name.indexOf('Maribor') >= 0)
	const journeys = await sz.journeys(maribor, ljubljana, date)
	t.ok(journeys.length >= 1, 'journeys length')
	const journey = journeys[0]
	t.ok(journey.type === 'journey', 'journey type')
	if (isObject(journey.price)) {
		t.ok(isNumber(journey.price.amount) && journey.price.amount > 0, 'journey price amount')
		t.ok(journey.price.currency === 'EUR', 'journey price currency')
		// todo: price.fares
	}
	t.ok(journey.legs.length >= 1, 'journey legs length')
	const leg = journey.legs.find((x) => !!x.product)
	t.ok(isStation(leg.origin), 'journey leg origin')
	t.ok(isStation(leg.destination), 'journey leg destination')
	t.ok(isDate(leg.arrival), 'journey leg arrival')
	t.ok(isDate(leg.departure), 'journey leg departure')
	t.ok(+leg.arrival >= +leg.departure, 'journey leg arrival > departure')
	t.ok(isString(leg.trainNumber) && leg.trainNumber.length > 0, 'journey leg trainNumber')
	t.ok(isString(leg.product) && leg.product.length > 0, 'journey leg product')
	t.ok(isSZ(leg.operator), 'journey leg operator')
	t.ok(leg.mode === 'train', 'journey leg mode')
	t.ok(leg.public === true, 'journey leg public')

	// timetable
	const timetable = await sz.timetable(leg.trainNumber, leg.origin, leg.destination, date)
	t.ok(timetable.every(isTrainStop), 'train stops')

	t.end()
})
