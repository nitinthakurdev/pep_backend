import { FindByUsername } from "../services/User.services.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { VerifyToken } from "../utils/JWTHandler.js";


export const Autherization = AsyncHandler(async (req, _res, next) => {
    const token = req.headers?.authorization?.split(' ')[1] ||req.cookies 

    const { username } = VerifyToken(token);

    const user = await FindByUsername(username);

    req.currentUser = user;

    next()

});

