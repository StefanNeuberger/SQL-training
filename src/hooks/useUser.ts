"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";

const USERNAME_KEY = "sql_training_username";
const USER_ID_KEY = "sql_training_user_id";

export function useUser() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getOrCreateUser = trpc.user.getOrCreate.useMutation();

  useEffect(() => {
    const storedUsername = localStorage.getItem(USERNAME_KEY);
    const storedUserId = localStorage.getItem(USER_ID_KEY);

    if (storedUsername && storedUserId) {
      setUsername(storedUsername);
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const user = await getOrCreateUser.mutateAsync({ username: trimmed });
      localStorage.setItem(USERNAME_KEY, trimmed);
      localStorage.setItem(USER_ID_KEY, user.id);
      setUsername(trimmed);
      setUserId(user.id);
    },
    [getOrCreateUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USER_ID_KEY);
    setUsername(null);
    setUserId(null);
  }, []);

  return { username, userId, isLoading, login, logout };
}
