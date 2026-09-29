export const requirePro = (
    req: any,
    res: any,
    next: any
) => {

    if (
        req.user?.subscriptionPlan !== "PRO" ||
        req.user?.subscriptionStatus !== "active"
    ) {
        return res.status(403).json({
            message:
                "Pro subscription required",
        })
    }

    next()
}