
const handleFacebookCreate = () => (hook) => {
  // Pass through this hook if there's no facebook data
  if (!hook.data.facebookId
    || !hook.data.facebook
    || !hook.data.facebook.email
    || (!hook.data.facebook.name
      && !hook.data.facebook.first_name
      && !hook.data.facebook.last_name)
    ) {
    return Promise.resolve(hook);
  }

  const userService = hook.app.service('/users');

  // Check whether a user with same facebook email exists
  return userService.find({ query: { email: hook.data.facebook.email } })
    .then(results => {
      // Handle answer in both array and object forms
      const existingUser = results[0] || (results.data && results.data[0]);

      // User properties to be created or updated
      const data = {
        facebookId: hook.data.facebookId,
        email: hook.data.facebook.email,
        name: hook.data.facebook.name ||
          `${hook.data.facebook.first_name} ${hook.data.facebook.last_name}`,
      };

      // Patch existing user's properties
      if (existingUser) {
        return userService.patch(existingUser._id, data) // eslint-disable-line no-underscore-dangle
          .then(updatedUser => {
            // Set `hook.result` to skip the actual `create` since we updated it already
            hook.result = updatedUser; // eslint-disable-line no-param-reassign

            return Promise.resolve(hook);
          });
      }
      // Create a new user if not exist
      return userService.create(data)
        .then(createdUser => {
          hook.result = createdUser; // eslint-disable-line no-param-reassign

          return Promise.resolve(hook);
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
};

module.exports = handleFacebookCreate;
