const router=require("express").Router();const auth=require("../middleware/auth.middleware");const c=require("../controllers/notification.controller");
router.get("/",auth,c.getNotifications);router.post("/device",auth,c.registerDevice);router.patch("/read-all",auth,c.markAllRead);router.patch("/:id/read",auth,c.markRead);router.delete("/:id",auth,c.deleteNotification);module.exports=router;
