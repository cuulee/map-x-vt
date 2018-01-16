
module.exports = {
  pg : {
    con : {
      user : "",
      database : "",
      password : "<user password>",
      port : 5432,
      host : "localhost",
      key : "<pg encryption key>" 
    }
  },
  cache : {
    ttl : 1000 * 60 * 60 * 24 * 30 // time to live in ms
  },
  images : {
    paths : {
      permanent : "/Users/fxi/Documents/unep_grid/map-x/data/mx_user_data",
      temporary : "/tmp/",
      url : "/userdata/"
    }
  }
};



