import { Router, Request, Response } from "express";
import { db } from "../db";
import { NewUser, users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcryptjs from 'bcryptjs'; 

const authRouter = Router();

interface SignUpBody {
    name: string;
    email: string;
    password: string;
}

interface SignInBody {
    email: string;
    password: string;
}


authRouter.post("/signup", async (req: Request<{}, {}, SignUpBody>, res: Response) => {
    try {
        // get req body
       const { name, email, password} =  req.body;

        // check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length) {
            res.status(400).json({ error: "User already exists" });
            return;
        } 
        // hash password
        const hashedPassword = await bcryptjs.hash(password, 8)
        
        // create a new user and store in db
        const newUser: NewUser = {
            name,
            email,
            password: hashedPassword,
        };

        const [user] = await db.insert(users).values(newUser).returning();
        res.status(201).json(user);
        

    } catch (error) {
        res.status(500).json({ error: error });
    }
});

authRouter.post("/signin", async (req: Request<{}, {}, SignInBody>, res: Response) => {
    try {
        // get req body
       const { email, password} =  req.body;

        // check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (!existingUser) {
            res.status(400).json({ error: "User with this email does not exist!" });
            return;
        } 

        // check if password is correct
        const isPasswordValid = await bcryptjs.compare(password, existingUser[0].password)
        if (!isPasswordValid) {
            res.status(400).json({ error: "Incorrect password!" });
            return;
        }

        res.json(existingUser);
        

    } catch (error) {
        res.status(500).json({ error: error });
    }
});


authRouter.get("/", (req, res) => {
    res.send("Hey there! from auth");
});

export default authRouter;

