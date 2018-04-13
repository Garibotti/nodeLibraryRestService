//FROM INTERNET default config.
//source https://medium.com/node-and-beyond/environment-dependent-node-js-configuration-b51149286e7e
var config = {
  production: {
    session: {
      key: '',
      secret: ''
    },
    database: ''
  },
  default: {
    secretKey: 'secretKey',
    database: 
    {
      host  : "127.0.0.1",
      user  : "root", 
      password: "root", 
      database: "locadora",
      port  : "8889"
    }
  }
}

exports.get = function get(env) {
  return config[env] || config.default;
}