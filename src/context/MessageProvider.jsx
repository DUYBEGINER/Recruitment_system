import React, { createContext, useContext } from 'react';
import { message } from 'antd';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = {
    success: (content, duration = 3) => {
      messageApi.success({
        content,
        duration,
        style: { zIndex: 9999 } // Đảm bảo hiển thị trên cùng
      });
    },
    error: (content, duration = 3) => {
      messageApi.error({
        content,
        duration,
        style: { zIndex: 9999 }
      });
    },
    warning: (content, duration = 3) => {
      messageApi.warning({
        content,
        duration,
        style: { zIndex: 9999 }
      });
    },
    loading: (content, duration = 0) => {
      return messageApi.loading({
        content,
        duration,
        style: { zIndex: 9999 }
      });
    },
    info: (content, duration = 3) => {
      messageApi.info({
        content,
        duration,
        style: { zIndex: 9999 }
      });
    }
  };

  return (
    <MessageContext.Provider value={showMessage}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within MessageProvider');
  }
  return context;
};