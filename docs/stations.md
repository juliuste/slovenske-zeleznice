# `stations()`

Get a list of all operated stations. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve in an array of `station`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format). (_This request may take a few seconds._)

```js
const sz = require('slovenske-zeleznice')

sz.stations()
.then(console.log)
```

## Response

```js
[
    {
        "type": "station",
        "id": "44652",
        "name": "Ajdovščina"
    },
    {
        "type": "station",
        "id": "44704",
        "name": "Anhovo"
    },
    {
        "type": "station",
        "id": "43856",
        "name": "Atomske Toplice hotel"
    }
    // …
]
```
