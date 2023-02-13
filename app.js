const express = require('express');
const bodyParser = require('body-parser');
const {router} = require("./src/routes/church") ;
const cors = require('cors');
const dotenv =  require('dotenv');

dotenv.config()

const app = express();
const PORT = 4000;
const HOSTNAME = 'localhost'

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/church_sys/api/v1/', router);
app.get('/', (req, res) => res.send('Congratulations you have reached the Hearts Blaze API!!!'));

app.listen(PORT, () => console.log(`listening on Port 'http://${HOSTNAME}:${PORT}`));
