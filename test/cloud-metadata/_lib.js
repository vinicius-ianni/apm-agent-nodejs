const express = require('express')
const fixtures = require('./_fixtures')

/**
 * Add AWS metadata route
 *
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-identity-documents.html
 */
function addAwsRoute (app, fixture) {
  app.get('/latest/dynamic/instance-identity/document', (req, res) => {
    res.send(fixture.response)
  })

  return app
}

/**
 * Add GCP metadata route
 *
 * Requests require the Metadata-Flavor and the
 * recursive query-string parameter.
 *
 * https://cloud.google.com/compute/docs/storing-retrieving-metadata#querying
 */
function addGcpRoute (app, fixture) {
  app.get('/computeMetadata/v1/instance', (req, res) => {
    if (!req.query.recursive) {
      throw new Error('recursive GET parameter required')
    }

    if (req.header('Metadata-Flavor') !== 'Google') {
      throw new Error('Metadata-Flavor: Google header required')
    }

    res.send(fixture.response)
  })

  return app
}

/**
 * Add Azure metadata route
 *
 * Requests require the api-version query string parameter
 * as well as the Metadata header.
 *
 * https://docs.microsoft.com/en-us/azure/virtual-machines/windows/instance-metadata-service
 */
function addAzureRoute (app, fixture) {
  app.get('/metadata/instance', (req, res) => {
    if (!req.query['api-version']) {
      throw new Error('api-version GET parameter required')
    }

    if (req.header('Metadata') !== 'true') {
      throw new Error('Metadata header required')
    }

    res.send(fixture.response)
  })

  return app
}

function addRoutesToExpressApp (app, provider, fixture) {
  switch (provider) {
    case 'aws':
      return addAwsRoute(app, fixture)
    case 'gcp':
      return addGcpRoute(app, fixture)
    case 'azure':
      return addAzureRoute(app, fixture)
    default:
      throw Error(`I don't know how to start a ${provider} server`)
  }
}

/**
 * Creates an express server that mocks out metadata responses
 *
 * Usage: createTestServer(provider, fixtureName)
 *
 * Returns an express server with a route name that matches
 * the real meta-data provider's route name and will return
 * data as configured in the _fixtures module.
 *
 * @param {string} provider name of cloud meta data provider
 * @param {string} fixtureName name of to response fixtures
 */
function createTestServer (provider, fixtureName) {
  const providerFixtures = fixtures[provider] ? fixtures[provider] : []
  const fixture = providerFixtures.filter(function (item) {
    return item.name === fixtureName
  }).pop()

  if (!fixture) {
    throw new Error(`Unknown ${provider} fixtured named ${fixtureName}`)
  }
  const app = express()
  return addRoutesToExpressApp(app, provider, fixture)
}

module.exports = {
  createTestServer
}
