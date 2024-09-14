import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [notesUpdated, setNotesUpdated] = useState(false);
  const [quotesUpdated, setQuotesUpdated] = useState(false);

  return (
    <AppContext.Provider value={{ notesUpdated, setNotesUpdated, quotesUpdated, setQuotesUpdated }}>
      {children}
    </AppContext.Provider>
  );
};
