import express, { Request, Response } from "express";
import productsRoutes from './routes/products/index.js'
import authRoutes from './routes/auth/index.js'
import { setupSwagger } from "../swagger.js";
import path from 'path'
import {fileURLToPath} from 'url';

const PORT = process.env.PORT;
const app = express();

// get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Products endpoints
app.use('/products', productsRoutes);
app.use('/auth', authRoutes);

// Swagger setup
setupSwagger(app);

if(process.env.NODE_ENV === 'dev') {
    app.listen(3000, () => {
        console.log(`Example app listening on port ${PORT}!`);
    });
}
