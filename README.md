# RSS Aggregator

## Description
This project is a service that allows you to add RSS feeds and read their posts in a convenient way. The aggregator constantly checks for updates and adds new posts if there are any.

### Features:
* Validating the input and data;
* Friendly error output;
* Check for an update of the added feeds every 5 seconds;
* Marking the seen publications.

## Usage instruction

### Install
```sh
make install
```
### Run the dev-server
```sh
make develop
```

### Build
```sh
make build
```

## Maintainability status and Node CI:
[![Maintainability](https://api.codeclimate.com/v1/badges/cec525c7d6bf13c7a2c2/maintainability)](https://codeclimate.com/github/elizablok/rss-aggregator/maintainability)
[![Node CI](https://github.com/elizablok/rss-aggregator/actions/workflows/node-ci.yml/badge.svg)](https://github.com/elizablok/rss-aggregator/actions/workflows/node-ci.yml)

[App](https://this-is-rss-aggregator.vercel.app/)
