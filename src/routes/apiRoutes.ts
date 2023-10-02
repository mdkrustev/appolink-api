import {Router, Request, Response} from 'express';
import {orm, encode} from "../service/service";

const router = Router();

router.post('/register', async (req: Request, res:Response) => {
    const user = req.body.all;
    console.log('')
})

router.get('/', async (req: Request, res: Response) => {

    const user = {
        name: 'Marko',
        email: 'ddststtfz@ssasdsvbgdte8vgr.com',
        phone: '123123123',
        password: 'o4pos331!',
        c_password: 'o4pos331!2'
    };

    const validate = {email: ['unique', 'required', 'email'], phone: ['required'], c_password: ['confirm']}
    const result = orm.create('users', user, validate, {password: encode.passwordHash()})

    res.json(result);
});

router.get('/login', async (req: Request, res: Response) => {
    const user = {email: 'ddststtfz@ssasdsvbgdte8vgr.com'};
    const result:any = orm.select('users', user).one()
    if(result && result.password) {
        result.check = await encode.comparePassword('o4pos331!', result.password)
        result.check = await encode.comparePassword('o4pos331!', result.password)
    }
    res.json(result);
});

export default router;
