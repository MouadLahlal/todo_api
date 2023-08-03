const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auth = require('./routes/auth/index');
const tasks = require('./routes/tasks/index');
const lists = require('./routes/lists/index');
const stats = require('./routes/stats/index');

const app = express();

app.use(cors());
app.use('/auth', auth);
app.use('/tasks', tasks);
app.use('/lists', lists);
app.use('/stats', stats);

app.listen(3001);