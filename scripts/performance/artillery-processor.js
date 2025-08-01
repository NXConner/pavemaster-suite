// Artillery processor for custom logic
module.exports = {
  setRandomUser,
  logResponse,
  validateResponse
};

function setRandomUser(requestParams, context, ee, next) {
  // Generate random test user data
  context.vars.testEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
  context.vars.testPassword = 'TestPassword123!';
  return next();
}

function logResponse(requestParams, response, context, ee, next) {
  // Log response for debugging
  if (response.statusCode >= 400) {
    console.log(`Error ${response.statusCode} for ${requestParams.url}`);
  }
  return next();
}

function validateResponse(requestParams, response, context, ee, next) {
  // Custom response validation
  if (response.statusCode === 200) {
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      // Check if it's a valid HTML response
      if (!response.body.includes('<!DOCTYPE html>')) {
        console.warn('Invalid HTML response detected');
      }
    }
  }
  return next();
}