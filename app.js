import express from 'express';
import bodyParser from 'body-parser';
import church from "./src/routes/church.js";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config()

const CORS = cors();
const app = express();
const PORT = process.env.PORT ||5000;
const HOSTNAME = '127.0.0.1'

app.use(express.urlencoded({ extended: false }));

app.use(CORS);
app.use(bodyParser.json());
app.use('/church_sys/api/v1/', church);
app.get('/', (req, res) => res.send('Congratulations you have reached the Hearts Blaze API!!!'));

app.listen(PORT, () => console.log(`listening on Port 'http://${HOSTNAME}:${PORT}`));