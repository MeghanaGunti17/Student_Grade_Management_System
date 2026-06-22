const Notification = require("../models/Notification");

const getMyNotifications = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 20,
    } = req.query;

    const skip =
      (Number(page) - 1) *
      Number(limit);

    const [
      data,
      total,
      unread,
    ] = await Promise.all([
      Notification.find({
        recipient:
          req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(
          Number(limit)
        ),

      Notification.countDocuments(
        {
          recipient:
            req.user._id,
        }
      ),

      Notification.countDocuments(
        {
          recipient:
            req.user._id,
          isRead: false,
        }
      ),
    ]);

    res.json({
      success: true,
      data,
      total,
      unread,
    });
  } catch (err) {
    next(err);
  }
};

const markRead = async (
  req,
  res,
  next
) => {
  try {
    await Notification.findOneAndUpdate(
      {
        _id:
          req.params.id,
        recipient:
          req.user._id,
      },
      {
        isRead: true,
        readAt:
          new Date(),
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (
  req,
  res,
  next
) => {
  try {
    await Notification.updateMany(
      {
        recipient:
          req.user._id,
        isRead: false,
      },
      {
        isRead: true,
        readAt:
          new Date(),
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const sendNotification =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        recipientId,
        type,
        title,
        message,
        priority,
      } = req.body;

      const notification =
        await Notification.create(
          {
            recipient:
              recipientId,

            sender:
              req.user._id,

            type,
            title,
            message,

            priority:
              priority ||
              "medium",
          }
        );

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  };

module.exports = {
  getMyNotifications,
  markRead,
  markAllRead,
  sendNotification,
};