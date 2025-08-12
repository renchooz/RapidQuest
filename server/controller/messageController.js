import ProcessedMessage from "../models/ProcessedMessage.js";

export const sendMessage = async (req, res) => {
  try {
    const { from, text } = req.body;
    const to = req.params.to;

    if (!from || !text) {
      return res.status(400).json({ error: "From and text are required" });
    }

    const newMessage = await ProcessedMessage.create({
      from,
      to,
      text,
      type: "text",
      timestamp: Math.floor(Date.now() / 1000).toString(),
      status: "sent",
      messageId: `local-${Date.now()}`,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { from } = req.query;
    const to = req.params.to;

    if (!from || !to) {
      return res.status(400).json({ error: "From and To are required" });
    }
    console.log(from + to);

    const filter = {
      $or: [
        { from: from, to: to },
     
        { from: to, to: from },
        { from: from, wa_id: to },
        { wa_id: to, from: to },
      ],
    };

    const messages = await ProcessedMessage.find(filter).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId;

    const conversations = await ProcessedMessage.aggregate([
      {
        $project: {
          wa_id: {
            $cond: [{ $eq: ["$from", currentUserId] }, "$to", "$from"],
          },
          from: 1,
          to: 1,
          text: 1,
          status: 1,
          timestamp: 1,
        },
      },
      { $match: { wa_id: { $ne: null } } }, 
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$wa_id",
          wa_id: { $first: "$wa_id" },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.timestamp": -1 } },
    ]);

    res.status(200).json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
