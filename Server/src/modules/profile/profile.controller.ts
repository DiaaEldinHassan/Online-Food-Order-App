import { Router, Request, Response, NextFunction } from "express";
import { profileService } from "./profile.service";
import { updateProfileSchema } from "./profile.validation";
import { validate } from "../../middleware/validation.middleware";
import { successReturn } from "../../common/utils/successReturn.utils";
import { authentication } from "../../middleware/auth.middleware";
import { ERole } from "../../common";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

router.use(authentication([ERole.customer, ERole.admin, ERole.driver]));

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.getProfile(req.user._id);
    successReturn(profile, 200, res);
  } catch (error) {
    next(error);
  }
});

router.patch("/", validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await profileService.updateProfile(req.user._id, req.body);
    successReturn(result, 200, res);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/profile-pic/upload",
  upload.single("avatar"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }
      const result = await profileService.uploadProfilePic(req.user._id, req.file);
      successReturn(result, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
