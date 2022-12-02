import { Router } from 'express';
import { updateUserController } from '../controllers/user.controller';
import validateResource from '../middlewares/validateResource';
import { updateUserSchema } from '../schema/user.schema';

const router = Router()

router.route('/update').patch(validateResource(updateUserSchema), updateUserController)

export default router