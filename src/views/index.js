

module.exports = function () {
  const app = this;

  app.get('/', (req, res) => {
    res.render('index', {});
  });

  // Authentication Routing
  app.get('/login', (req, res) => {
    res.render('login', {});
  });
  app.post('/login', (req, res) => {
    console.log(req);
    console.log(res);
    res.redirect('/register');
  });
  app.get('/register', (req, res) => {
    res.render('register', {});
  });
  // End Authentication Routing
};
