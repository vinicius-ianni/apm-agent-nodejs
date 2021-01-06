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

function addRoutesToExpressApp (app, provider, fixture) {
  switch (provider) {
    case 'aws':
      return addAwsRoute(app, fixture)
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
  const fixture = loadFixtureData(provider, fixtureName)
  if (!fixture) {
    throw new Error(`Unknown ${provider} fixtured named ${fixtureName}`)
  }
  const app = express()
  return addRoutesToExpressApp(app, provider, fixture)
}

function loadFixtureData(provider, fixtureName) {
  const providerFixtures = fixtures[provider] ? fixtures[provider] : []
  const fixture = providerFixtures.filter(function (item) {
    return item.name === fixtureName
  }).pop()
  return fixture
}

module.exports = {
  createTestServer,
  loadFixtureData
}
