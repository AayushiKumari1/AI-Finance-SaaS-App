// import {Router} from "express"
// import { bulkDeleteTransactionController, bulkTransactionController, createTransactionController, deleteTransactionController, duplicateTransactionController, getAllTransactionController, getTransactionByIdController, scanReceiptController, updateTransactionController } from "../controllers/transaction.controller.js"
// import { upload } from "../config/cloudinary.config.js"

// const transactionRoutes = Router()

// transactionRoutes.post("/create", createTransactionController )

// transactionRoutes.get("/all", getAllTransactionController )

// transactionRoutes.post(
//     "/scan-receipt",
//     upload.single("receipt"),
//     scanReceiptController
// )

// transactionRoutes.get("/:id", getTransactionByIdController )

// transactionRoutes.post("/bulk-transaction", bulkTransactionController )

// transactionRoutes.put("/duplicate/:id", duplicateTransactionController )
// transactionRoutes.put("/update/:id", updateTransactionController )
// transactionRoutes.delete("/delete/:id", deleteTransactionController )
// transactionRoutes.delete("/bulk-delete", bulkDeleteTransactionController )

// export default transactionRoutes

import {Router} from "express"
import { bulkDeleteTransactionController, bulkTransactionController, createTransactionController, deleteTransactionController, duplicateTransactionController, getAllTransactionController, getTransactionByIdController, scanReceiptController, updateTransactionController } from "../controllers/transaction.controller.js"
import { upload } from "../config/cloudinary.config.js"
import { requirePro } from "../middlewares/subscription.middleware.js"

const transactionRoutes = Router()

transactionRoutes.post("/create", createTransactionController )

transactionRoutes.get("/all", getAllTransactionController )

transactionRoutes.post(
    "/scan-receipt",
    requirePro, // AI receipt scanning is a Pro feature
    upload.single("receipt"),
    scanReceiptController
)

transactionRoutes.get("/:id", getTransactionByIdController )

transactionRoutes.post("/bulk-transaction", bulkTransactionController )

transactionRoutes.put("/duplicate/:id", duplicateTransactionController )
transactionRoutes.put("/update/:id", updateTransactionController )
transactionRoutes.delete("/delete/:id", deleteTransactionController )
transactionRoutes.delete("/bulk-delete", bulkDeleteTransactionController )

export default transactionRoutes