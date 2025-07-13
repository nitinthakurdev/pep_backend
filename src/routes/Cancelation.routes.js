import { Router } from "express";
import { CreateCancelation } from "../controller/Cancelation.controller.js";


const router = Router();

router.route("/create").post(CreateCancelation)


export default router;