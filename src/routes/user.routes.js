import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.get("/test", (req, res) => {
    res.send("Working!");
});

router.post("/register", registerUser);

export default router;