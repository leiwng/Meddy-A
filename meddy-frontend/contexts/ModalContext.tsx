'use client'
import React, { createContext, useContext, useReducer, ReactNode, useState } from 'react';


type ModalContextType = {
  imgModal: { visible: boolean, url: string };
  titleModal: { visible: boolean, title: string, content: any };
  changeTitleModal: (visible: boolean, title: string, content: any) => void;
  changeImgModal: (visible: boolean, url: string) => void;
};

// Create context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Provider component
export function ModalProvider({ children }: { children: ReactNode }) {
  const [titleModal, setTitleModal] = useState({ visible: false, title: '', content: null });
  const [imgModal, setImgModal] = useState({ visible: false, url: '' });

  const changeTitleModal = (visible: boolean, title: string, content: any) => {
    setTitleModal({ visible, title, content });
  };
  const changeImgModal = (visible: boolean, url: string ) => {
    setImgModal({ visible, url });
  };
  return (
    <ModalContext.Provider value={{ titleModal, changeTitleModal, imgModal, changeImgModal }}>
      {children}
    </ModalContext.Provider>
  );
}

// Custom hook for using the modal context
export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}