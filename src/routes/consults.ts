
import { Router } from "express";
import  {ConsultController}  from "../controllers/consult.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { auditLog } from "../middleware/auditLog.js";
import {
  createConsultSchema,
  //updateConsultSchema,
} from "../middleware/validator.js";

const router = Router();
const consultController = new ConsultController();

// router.use(authenticate);

router.get("/consults", authenticate, consultController.list);
router.get("/consults/:id", authenticate, auditLog("VIEW", "consult"), consultController.getById);//needs auditlog
router.post(
  "/consults",
  /* (req, res, next) => { // <-- New Debug Middleware
    console.log("DEBUG: Request Body received by router:", req.body);
    next();
  }, */
  validate(createConsultSchema),
  authenticate,
  auditLog("CREATE", "consult"),  
  consultController.create
);
router.post("/consults/:id", authenticate, auditLog("UPDATE", "consult"), consultController.updateConsult ),
router.patch(
  "/consults/:id",
  
  authenticate,
  auditLog("UPDATE", "consult"),  
  consultController.update
);
router.post("/consults/:id/save", authenticate, auditLog("Save Draft", "consult answer"), consultController.saveDraft);
router.post("/consults/:id/accept", authenticate, auditLog("ACCEPT", "consult"), consultController.accept);
router.post("/consults/:id/answer", authenticate, auditLog("ANSWER", "consult"), consultController.answer);
router.post("/consults/:id/decline", authenticate, auditLog("DECLINE", "consult"), consultController.decline);
router.post("/consults/:id/delete", authenticate, auditLog("DELETE", "consult"), consultController.delete);

router.get("/report/:id", authenticate, consultController.getReport)
router.get("/consult/:id/provider", authenticate, consultController.getConsultProvider)


export default router;
