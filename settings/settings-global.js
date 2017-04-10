s = {};
s.pg = {};

s.pg.con = {
  user : "",
  database : "",
  password : "<user password>",
  port : 5432,
  host : "localhost",
  key : "<pg encryption key>" 
};


s.cache = {
  ttl : 1000 * 60 * 60 * 24 * 30 // time to live in ms
};

module.exports = s ;
