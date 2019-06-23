
const tapeWithoutPromise = require('tape')
const addPromiseSupport = require('tape-promise').default
const tape = addPromiseSupport(tapeWithoutPromise)
const { DateTime } = require('luxon')
const validate = require('validate-fptf')()
const fptiTests = require('fpti-tests')
const getStream = require('get-stream').array

const sz = require('.')
const pkg = require('./package.json')

const when = DateTime.fromObject({ zone: 'Europe/Ljubljana', weekday: 4 }).plus({ weeks: 1, hours: 5 }).toJSDate() // next thursday, 05:00
const isStationWithName = (s, name) => (s.type === 'station' && s.name === name)

tape('slovenske-zeleznice fpti tests', async t => {
	await t.doesNotReject(fptiTests.packageJson(pkg), 'valid package.json')
	t.doesNotThrow(() => fptiTests.packageExports(sz, ['stations.all', 'journeys']), 'valid module exports')
	t.doesNotThrow(() => fptiTests.stationsAllFeatures(sz.stations.all.features, []), 'valid stations.all features')
	t.doesNotThrow(() => fptiTests.journeysFeatures(sz.journeys.features, ['when', 'departureAfter', 'results', 'interval', 'transfers']), 'valid journeys features')
})

tape('slovenske-zeleznice.stations.all', async t => {
	const stations = await getStream(sz.stations.all())
	t.ok(stations.length > 30, 'stations length')

	// base-check all stations
	for (let station of stations) t.doesNotThrow(() => validate(station), 'valid fptf')

	// deep-check ljubljana station
	const ljubljana = stations.find(x => x.name.indexOf('Ljubljana') >= 0)
	t.ok(!!ljubljana, 'ljubljana')
})

tape('slovenske-zeleznice.journeys', async t => {
	const ljubljana = '42300'
	const maribor = '43400'

	const journeys = await sz.journeys(ljubljana, maribor, { when })
	t.ok(journeys.length >= 3, 'number of journeys')
	for (let journey of journeys) {
		t.doesNotThrow(() => validate(journey), 'valid fptf')
		t.ok(isStationWithName(journey.legs[0].origin, 'Ljubljana'), 'origin')
		t.ok(isStationWithName(journey.legs[journey.legs.length - 1].destination, 'Maribor'), 'destination')
		t.ok(+new Date(journey.legs[0].departure) >= +when, 'departure')

		for (let leg of journey.legs) {
			t.ok(leg.operator.id === 'sž', 'leg operator')
			t.doesNotThrow(() => validate(leg.line), 'valid fptf')
			t.ok(leg.line.operator.id === 'sž', 'leg line operator')
		}

		t.ok(journey.price.amount > 0, 'price amount')
		t.ok(journey.price.currency === 'EUR', 'price currency')
	}
})

tape('slovenske-zeleznice.journeys opt.results, opt.departureAfter', async t => {
	const ljubljana = '42300'
	const maribor = '43400'

	const journeys = await sz.journeys(ljubljana, maribor, { departureAfter: when, results: 2 })
	t.ok(journeys.length === 2, 'number of journeys')
	for (let journey of journeys) t.doesNotThrow(() => validate(journey), 'valid fptf')
})

tape('slovenske-zeleznice.journeys opt.transfers', async t => {
	const ljubljanaStegne = '42317'
	const maribor = '43400'

	const journeysWithoutTransfer = await sz.journeys(ljubljanaStegne, maribor, { when, transfers: 0 })
	t.ok(journeysWithoutTransfer.length === 0, 'number of journeys')

	const journeysWithTransfer = await sz.journeys(ljubljanaStegne, maribor, { when, transfers: 2 })
	t.ok(journeysWithTransfer.length > 0, 'number of journeys')
	for (let journey of journeysWithTransfer) {
		t.doesNotThrow(() => validate(journey), 'valid fptf')
		t.ok(journey.legs.length >= 2, 'number of legs')
	}
})

tape('slovenske-zeleznice.journeys opt.interval', async t => {
	const ljubljanaStegne = '42317'
	const maribor = '43400'
	const dayAfterWhen = DateTime.fromJSDate(when, { zone: 'Europe/Ljubljana' }).plus({ days: 1 }).toJSDate()

	const journeysWithoutInterval = await sz.journeys(ljubljanaStegne, maribor, { when })
	for (let journey of journeysWithoutInterval) t.doesNotThrow(() => validate(journey), 'valid fptf')
	t.ok(journeysWithoutInterval.length > 0, 'precondition')
	const journeysWithoutIntervalDayAfterWhen = journeysWithoutInterval.filter(journey => +new Date(journey.legs[0].departure) >= +dayAfterWhen)
	t.ok(journeysWithoutIntervalDayAfterWhen.length === 0, 'number of journeys')

	const journeysWithInterval = await sz.journeys(ljubljanaStegne, maribor, { when, interval: 30 * 60 }) // journeys for the next 30h
	for (let journey of journeysWithInterval) t.doesNotThrow(() => validate(journey), 'valid fptf')
	t.ok(journeysWithInterval.length > 0, 'precondition')
	const journeysWithIntervalDayAfterWhen = journeysWithInterval.filter(journey => +new Date(journey.legs[0].departure) >= +dayAfterWhen)
	t.ok(journeysWithIntervalDayAfterWhen.length > 0, 'number of journeys')
})

// 	// timetable
// 	const timetable = await sz.timetable(leg.trainNumber, leg.origin, leg.destination, date)
// 	t.ok(timetable.every(isTrainStop), 'train stops')
