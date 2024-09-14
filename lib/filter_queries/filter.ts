export const UPDATE_KEYS = [
  "message",
  "edited_message",
  "channel_post",
  "edited_channel_post",
  "business_connection",
  "business_message",
  "edited_business_message",
  "deleted_business_messages",
  "inline_query",
  "chosen_inline_result",
  "callback_query",
  "shipping_query",
  "pre_checkout_query",
  "purchased_paid_media",
  "poll",
  "poll_answer",
  "my_chat_member",
  "chat_member",
  "chat_join_request",
  "message_reaction",
  "message_reaction_count",
  "chat_boost",
  "removed_chat_boost",
];

export const L1_SHORTCUTS = {
  "": ["message", "channel_post"],
  "msg": ["message", "channel_post"],
  "edit": ["edited_message", "edited_channel_post"],
};

export const L2_SHORTCUTS = {
  "": ["entities", "caption_entities"],
  "media": ["photo", "video"],
  "file": [
    "photo",
    "animation",
    "audio",
    "document",
    "video",
    "video_note",
    "voice",
    "sticker",
  ],
};
