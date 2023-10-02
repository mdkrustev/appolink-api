import express, {Request, Response} from 'express';
import './db/migration';
import apiRoutes from "./routes/apiRoutes";
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/api', apiRoutes)
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}/api`);
});
