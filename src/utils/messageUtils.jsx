
export function openMessage(status, textMessage, time, message, messageApi, key) {
    messageApi.open({
      key,
      type: status,
      content: textMessage ? textMessage : "Null Text message",
      duration: status === 'loading' ? 0 : (time ? time : 2),
    });

}

