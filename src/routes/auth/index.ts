import { Router } from "express";
import { createUserSchema, loginSchema, usersTable } from "../../db/usersSchema.js";
import { validateData } from "../../middlewares/validationMiddleware.js";
import bcrypt from 'bcryptjs';
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the user
 *           example: 1
 *         email:
 *           type: string
 *           description: The user's email address
 *           example: user@example.com
 *         role:
 *           type: string
 *           description: The user's role
 *           example: user
 *         address:
 *           type: string
 *           description: The user's address
 *           example: 123 Main St
 *     UserInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address
 *           example: user@example.com
 *         password:
 *           type: string
 *           description: The user's password
 *           example: secure123
 *         role:
 *           type: string
 *           description: The user's role
 *           example: user
 *         address:
 *           type: string
 *           description: The user's address
 *           example: 123 Main St
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email address
 *           example: user@example.com
 *         password:
 *           type: string
 *           description: The user's password
 *           example: secure123
 *     LoginResponse:
 *       type: object
 *       required:
 *         - token
 *         - user
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided details. The password is hashed before storage.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router.post('/register', validateData(createUserSchema), async (req, res) => {
    try {
        const data = req.cleanBody;
        
        data.password = await bcrypt.hash(data.password, 10);
    
        const [user] = await db.insert(usersTable).values(data).returning();
    
        console.log(data);
        // @ts-ignore
        delete user.password;
        res.status(201).json({ user });
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user by email and password, returning a JWT token and user details.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication failed
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Something went wrong
 */
router.post('/login', validateData(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.cleanBody;

        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!user) {
            res.status(401).json({ error: 'Authentication failed' });
            return;
        }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            res.status(401).json({ error: 'Authentication failed' });
            return;
        }

        // Create a JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '12h' }
        );

        // @ts-ignore
        delete user.password;
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
});

export default router;