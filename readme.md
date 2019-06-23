# slovenske-zeleznice

JavaScript client for the Slovenian 🇸🇮 [Slovenske železnice (SŽ)](http://www.slo-zeleznice.si/) railway API. Inofficial, using *SŽ* endpoints. Ask them for permission before using this module in production.

[![npm version](https://img.shields.io/npm/v/slovenske-zeleznice.svg)](https://www.npmjs.com/package/slovenske-zeleznice)
[![Build Status](https://travis-ci.org/juliuste/slovenske-zeleznice.svg?branch=master)](https://travis-ci.org/juliuste/slovenske-zeleznice)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/slovenske-zeleznice.svg)](https://greenkeeper.io/)
[![fpti-js version](https://fpti-js.badges.juliustens.eu/badge/juliuste/slovenske-zeleznice)](https://fpti-js.badges.juliustens.eu/link/juliuste/slovenske-zeleznice)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation

```shell
npm install --save slovenske-zeleznice
```

## Usage

```javascript
const sz = require('slovenske-zeleznice')
```

The `slovenske-zeleznice` module conforms to the [FPTI-JS `0.3.2` standard](https://github.com/public-transport/fpti-js/tree/0.3.2) for JavaScript public transportation modules and exposes the following methods:

Method | Feature description | [FPTI-JS `0.3.2`](https://github.com/public-transport/fpti-js/tree/0.3.2)
-------|---------------------|--------------------------------------------------------------------
[`stations.all([opt])`](#stationsallopt) | All stations of the *SŽ* network, such as `Ljubljana` or `Maribor` | [✅ yes](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/stations-stops-regions.all.md)
[`journeys(origin, destination, [opt])`](#journeysorigin-destination-opt) | Journeys between stations | [✅ yes](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/journeys.md)
[`legStopovers(legId)`](#legStopoverslegid) | All stopovers for a leg (all stations the train passes on that leg) | ❌ no

---

### `stations.all([opt])`

Get **all** stations of the *SŽ* network, such as `Ljubljana` or `Maribor`. See [this method in the FPTI-JS `0.3.2` spec](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/stations-stops-regions.all.md).

#### Supported Options

There currently aren't any supported options for this method, but this might change in a future release.

#### Example

```js
const sz = require('slovenske-zeleznice')
const stationStream = sz.stations.all()

stationStream.on('data', item => {
    // item is an FPTF station object
    console.log(item)
})
```

```js
{
    type: "station",
    id: "42357",
    name: "Ljubljana Brinje"
}
```

---

### `journeys(origin, destination, [opt])`

Find journeys between stations. See [this method in the FPTI-JS `0.3.2` spec](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/journeys.md).

#### Supported Options

Attribute | Description | FPTI-spec | Value type | Default
----------|-------------|------------|------------|--------
`when` | Journey date, synonym to `departureAfter` | ✅ | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/date) | `new Date()`
`departureAfter` | List journeys with a departure (first leg) after this date | ✅ | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/date) | `new Date()`
`results` | Max. number of results returned | ✅ | `Number` | `null`
`interval` | Results for how many minutes after `when`/`departureAfter` | ✅ | `Number` | `null`
`transfers` | Max. number of transfers | ✅ | `Number` | `null`

Note that, unless `opt.interval` is specified, the module will return journeys that start after `when`/`departureAfter`, but before the beginning of the following calendar day in `Europe/Ljubljana` time zone.

#### Example

```js
const ljubljana = '42300'
const maribor = { // FPTF station
	type: 'station',
	id: '43400'
	// …
}
sz.journeys(ljubljana, maribor, { when: new Date('2019-06-27T05:00:00+0200'), transfers: 0 }).then(…)
```

```js
{
    type: "journey",
    id: "2004###2019-06-27###42300###43400",
    info: "Timetable valid from 9. Dec. 2018 do 14. Dec. 2019.",
    legs: [
        {
            origin: {
                type: "station",
                id: "42300",
                name: "Ljubljana"
            },
            destination: {
                type: "station",
                id: "43400",
                name: "Maribor"
            },
            departure: "2019-06-27T10:50:00.000+02:00",
            arrival: "2019-06-27T13:35:00.000+02:00",
            mode: "train",
            public: true,
            line: {
                type: "line",
                id: "2004",
                name: "LPV 2004",
                number: "2004",
                product: "LPV",
                mode: "train",
                public: true,
                operator: {
                    type: "operator",
                    id: "sž",
                    name: "Slovenske železnice",
                    url: "http://www.slo-zeleznice.si"
                }
            },
            operator: {
                type: "operator",
                id: "sž",
                name: "Slovenske železnice",
                url: "http://www.slo-zeleznice.si"
            },
            bicycle: true,
            wifi: false,
            id: "2004###2019-06-27###42300###43400"
        }
    ],
    price: {
        amount: 9.56,
        currency: "EUR"
    }
}
```

---

### `legStopovers(legId)`

All stopovers for a given leg (all stations the train passes on that leg). Obtain a `legId` using the [`journeys(origin, destination, [opt])`](#journeysorigin-destination-opt) method. Returns a `Promise` that resolves in a list of stopovers.

#### Example

```js
const legId = '2004###2019-06-27###42300###43400' // taken from the journeys example above
sz.legStopovers(legId).then(…)
```

```js
[
    {
        type: "stopover",
        stop: {
            type: "station",
            id: "42300",
            name: "Ljubljana"
        },
        departure: "2019-06-27T10:50:00.000+02:00",
        arrival: null
    },
    {
        type: "stopover",
        stop: {
            type: "station",
            id: "42212",
            name: "Ljubljana Polje"
        },
        departure: "2019-06-27T10:56:00.000+02:00",
        arrival: "2019-06-27T10:55:00.000+02:00"
    },
    // …
    {
        type: "stopover",
        stop: {
            type: "station",
            id: "43304",
            name: "Maribor Tezno"
        },
        departure: "2019-06-27T13:32:00.000+02:00",
        arrival: "2019-06-27T13:31:00.000+02:00"
    },
    {
        type: "stopover",
        stop: {
            type: "station",
            id: "43400",
            name: "Maribor"
        },
        departure: null,
        arrival: "2019-06-27T13:35:00.000+02:00"
    }
]
```

## Contributing

If you found a bug or want to propose a feature, feel free to visit [the issues page](https://github.com/juliuste/slovenske-zeleznice/issues).
