import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import church from "./routes/church.js";
import dotenv from 'dotenv';
dotenv.config()

const CORS = cors();
const app = express();
const PORT = process.env.PORT ||5000;

app.use(express.urlencoded({ extended: false }));

app.use(CORS);
app.use(bodyParser.json());
app.use('/church_sys/api/v1/', church);
app.get('/', (req, res) => res.send('Congratulations you have reached the Hearts Blaze API!!!'));

app.listen(PORT, () => console.log(`listening on Port 'http://localhost:${PORT}`));