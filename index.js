const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();


app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));


app.use(cors());

app.use(require('./routes/employees'));
app.use(require('./routes/auth'));
app.use(require('./routes/users'));


app.get('', (req, res) => {
    res.send('Api HR-Employees');
});

app.listen(3000);
console.log('Server on port', 3000);