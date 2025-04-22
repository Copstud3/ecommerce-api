import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'


export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token  = req.header('Authorization');

    if(!token) {
       res.status(401).json({error: 'Access denied'})
       return;
    }

    if (!process.env.JWT_SECRET) {
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    try {
        // decode jwt token data
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof decoded !== 'object' || !decoded?.userId){
            res.status(401).json({error: 'Access denied'})
            return;
        }
        req.userId = decoded.userId
        req.role = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({error: 'Access denied'})
        return;
    }
}

export const verifySeller = (req: Request, res: Response, next: NextFunction): void => {
    const role  = req.role;

    if(role !== 'seller') {
       res.status(401).json({error: 'Access denied'})
       return;
    }
    next();

}