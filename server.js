const express = require('express');
const app = express();

app.use(express.static(__dirname + '/dist'));
// TODO! REMOVE BEFORE DEPLOY
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/random', (req, res) => {
  res.send({rnd:Math.random()*1000});
})

app.all('*', (req, res) => {
  res.status(200).sendFile(__dirname + '/dist/index.html');
});


var port = process.env.PORT || '8080';
console.log(port);
app.listen(port);