# `timetable(trainNumber, origin, destination, date = new Date())`

Get timetable for a given train number between to stations (`origin`, `destination`) at a given date. Ignores the time and returns the schedule for the given day in timezone `Europe/Ljubljana`. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve in a timetable array or `null` if no timetable was found.

```js
const sz = require('slovenske-zeleznice')

sz.timetable('2800', '42200', {type: 'station', id: '43400', name: 'Maribor'}, new Date())
.then(console.log)
```

## Response

```js
[
    {
        "type": "station",
        "id": "42200",
        "name": "Zidani Most",
        "arrival": "2017-11-07T05:52:00.000Z",
        "departure": "2017-11-07T06:00:00.000Z"
    },
    {
        "type": "station",
        "id": "43001",
        "name": "Rimske Toplice",
        "arrival": "2017-11-07T06:07:00.000Z",
        "departure": "2017-11-07T06:08:00.000Z"
    },
    // …
    {
        "type": "station",
        "id": "43304",
        "name": "Maribor Tezno",
        "arrival": "2017-11-07T07:25:00.000Z",
        "departure": "2017-11-07T07:26:00.000Z"
    },
    {
        "type": "station",
        "id": "43400",
        "name": "Maribor",
        "arrival": "2017-11-07T07:29:00.000Z",
        "departure": "2017-11-07T07:29:00.000Z"
    }
]
```
