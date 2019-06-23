'use strict'

const { DateTime } = require('luxon')

const createStation = s => ({
	type: 'station',
	id: s.st_postaje,
	name: s.station || s.postaja
})

const parseDate = dt => {
	if (!dt.date || !dt.time) return null
	const baseDate = DateTime.fromISO(dt.date, { zone: 'Europe/Ljubljana' }) // @todo timezone
	const [_hours, _minutes] = dt.time.split(':') // @todo
	return baseDate.plus({ hours: +_hours, minutes: +_minutes }).toISO()
}

const parseBoolean = b => {
	if (b === 'true') return true
	if (b === 'false') return false
	return null
}

const toArray = entity => {
	if (!entity) return []
	if (Array.isArray(entity)) return entity
	return [entity]
}

module.exports = { createStation, parseDate, parseBoolean, toArray }
