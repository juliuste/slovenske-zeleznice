# slovenske-zeleznice

Client for the [Slovenske železnice](http://www.slo-zeleznice.si/) (SŽ, Slovenian Railways) SOAP API. Inofficial, please ask SŽ for permission before using this module in production.

[![npm version](https://img.shields.io/npm/v/slovenske-zeleznice.svg)](https://www.npmjs.com/package/slovenske-zeleznice)
[![Build Status](https://travis-ci.org/juliuste/slovenske-zeleznice.svg?branch=master)](https://travis-ci.org/juliuste/slovenske-zeleznice)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/slovenske-zeleznice.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/juliuste/slovenske-zeleznice.svg?style=flat)](LICENSE)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation

```shell
npm install --save slovenske-zeleznice
```

## Usage

This package mostly returns data in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format):

- [`stations()`](docs/stations.md) - List of operated stations
- [`timetable(trainNumber, origin, destination, date = new Date())`](docs/timetable.md) - Timetable for a given train between two stations
- [`journeys(origin, destination, date = new Date())`](docs/journeys.md) - Journeys between stations

## Contributing

If you found a bug or want to propose a feature, feel free to visit [the issues page](https://github.com/juliuste/slovenske-zeleznice/issues).
