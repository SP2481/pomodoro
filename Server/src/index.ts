import cors from 'cors';
import express from 'express';
import { mongo } from './config/db';
import './config/dotenv';
import Routes from './routes';

const app = express()
app.use(express.json());
app.use(cors({
    origin:'https://pomodoro-tawny-seven.vercel.app',
    credentials:true
}))
mongo;

new Routes(app)

app.get('/',(req, res) => {
    res.send('Backend working')
})

app.listen(process.env.PORT ?? "3000", () =>{
    console.log(`Server is running on port ${process.env.PORT}`);
})