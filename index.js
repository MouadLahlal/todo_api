const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auth = require('./route/auth/index');
const tasks = require('./route/tasks/index');
const lists = require('./route/lists/index');

const app = express();

app.use(cors());
app.use('/auth', auth);
app.use('/tasks', tasks);
app.use('/lists', lists);

app.listen(3000);