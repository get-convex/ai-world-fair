import React, { createContext, useContext, useState, useEffect } from "react";
import { faker } from "@faker-js/faker";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [sessionAvatar, setSessionAvatar] = useState<string | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem("floyd-session");
    const storedSessionName = localStorage.getItem("floyd-session-name");
    const storedSessionAvatar = localStorage.getItem("floyd-session-avatar");
    if (storedSession && storedSessionName && storedSessionAvatar) {
      setSession(storedSession);
      setSessionName(storedSessionName);
      setSessionAvatar(storedSessionAvatar);
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem("floyd-session", session);
    }
  }, [session]);

  useEffect(() => {
    if (sessionName) {
      localStorage.setItem("floyd-session-name", sessionName);
    }
  }, [sessionName]);

  useEffect(() => {
    if (sessionAvatar) {
      localStorage.setItem("floyd-session-avatar", sessionAvatar);
    }
  }, [sessionAvatar]);

  const createNewSession = () => {
    faker.seed();
    const newSession = faker.string.uuid();
    // const newSessionName = `${faker.internet.email().toLowerCase()}`;
    const newSessionName = "tomredman@convex.dev";
    const newSessionAvatar = `${faker.image.avatar()}`;
    setSession(newSession);
    setSessionName(newSessionName);
    setSessionAvatar(newSessionAvatar);
  };

  const clearSession = () => {
    createNewSession();
  };

  return (
    <SessionContext.Provider
      value={{ session, sessionName, sessionAvatar, clearSession }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
