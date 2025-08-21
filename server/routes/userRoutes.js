import express from "express";
import {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/userController";

const router = express.Router();

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.route("/").get(getAllUsers).post(createUser);

export default router;
