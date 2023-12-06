const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auth = require('./routes/auth/index');
const tasks = require('./routes/tasks/index');
const lists = require('./routes/lists/index');
const stats = require('./routes/stats/index');
const user = require('./routes/user/index');

const app = express();

app.use(cors());
app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
})
app.use('/auth', auth);
app.use('/tasks', tasks);
app.use('/lists', lists);
app.use('/stats', stats);
app.use('/user', user);

app.listen(3001);
