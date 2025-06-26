'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Client, Thread } from "@langchain/langgraph-sdk";
import { CONFIG } from '@/config-global';
import { useAuthContext } from '@/auth/hooks'
import { STORAGE_KEY } from '@/auth/context/jwt/constant';
import { createClient } from '@/utils/util';

interface ThreadContextType {
  userThreads: Thread[];
  threadId: string | undefined;
  setThreadId: (id: string) => void;
  getUserThreads: (id: string) => void;
  deleteThread: (id: string, callback: () => void) => void;
  getThreadById: (id: string) => Promise<Thread>;
  stopThread: (runId: string) => void;
  createThread: (id: string, inputTitle: string, expertstring: string) => void;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  
  const [otherThreads, setOtherThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState('ai')
  const [threadId, setThreadId] = useState<string>('');
  const [isUserThreadsLoading, setIsUserThreadsLoading] = useState(false);
  const { user } = useAuthContext();
  const [selectList, setSelectList] = useState([])
  const stopThread = async (runId: string) => {   
    if (threadId && runId) {
      const client = createClient();
      await client.runs.cancel(threadId, runId);
    }
  }
  const getUserThreads = async (id: string) => {
    setIsUserThreadsLoading(true);
    try {
      const client = createClient();

      const userThreads = (await client.threads.search({
        metadata: {
          user_id: id,
        },
        limit: 100,
      })) as Awaited<Thread[]>;

      if (userThreads.length > 0) {
        const filteredThreads = userThreads.filter(
          (thread) => {
            if (thread.status === 'busy') {
              return thread;
            }
            return thread.values && Object.keys(thread.values).length > 0
          },
        );
        setUserThreads(filteredThreads);
      }
    } finally {
      setIsUserThreadsLoading(false);
    }
  };
  const getOtherThreads = async (id: string) => {
    try {
      const client = createClient();

      const userThreads = (await client.threads.search({
        metadata: {
          mutil_expert: { [id]: id },
        },
        limit: 100,
      })) as Awaited<Thread[]>;

      if (userThreads.length > 0) {
        const filteredThreads = userThreads.filter(
          (thread) => {
            if (thread.status === 'busy') {
              return thread;
            }
            return thread.values && Object.keys(thread.values).length > 0
          },
        );
        setOtherThreads(filteredThreads);
      }
    } catch(err) {
      setOtherThreads([]);
    }
  }

  const deleteThread = async (id: string, callback) => {
    if (!user.userId) {
      throw new Error("User ID not found");
    }
    const client = createClient();
    await client.threads.delete(id);
    setUserThreads((prevThreads) => {
      const newThreads = prevThreads.filter(
        (thread) => thread.thread_id !== id,
      );
      return newThreads;
    });
    if (id === threadId) {
      callback();
    }
  };
  const getThreadById = async (id: string) => {
    const client = createClient();
    return (await client.threads.get(id)) as Awaited<Thread>;
  };
  const createThread = async (id: string, inputTitle: string, mutil_expert: any) => {
    const client = createClient();
    let thread;
    try {
      thread = await client.threads.create({
        metadata: {
          user_id: id,
          // expertstring,
          title: inputTitle,
          mutil_expert,
        },
      });
      if (!thread || !thread.thread_id) {
        throw new Error("Thread creation failed.");
      }
      setThreadId(thread.thread_id);
      // setUserThreads([thread, ...userThreads]);
      setUserThreads((prevThreads) => {
        return [thread, ...prevThreads];
      });
    } catch (e) {
      console.error("Error creating thread", e);
    }
    return thread;
  };
  const patchThread = async (editid: string, options) => {
    const client = createClient();
    let thread;
    try {
      thread = await client.threads.update(editid, {
        metadata: options,
      });
      setUserThreads((pres) => {
        return pres.map((value) => {
          if (value.thread_id === editid) {
            return { ...value, metadata: { ...value.metadata, ...options } };
          }
          return value;
        });
      });
    } catch (e) {
      console.error("Error creating thread", e);
    }
    return thread;
  };
  useEffect(() => {
    // console.log('user', user)
    if (user) {
      getUserThreads(user.userId);
    }
    if (user && user.role === 'expert') {
      getOtherThreads(user.userId);
    }
  }, [user]);

  return (
    <ThreadContext.Provider
      value={{
        userThreads,
        threadId,
        setThreadId,
        getUserThreads,
        deleteThread,
        getThreadById,
        createThread,
        stopThread,
        patchThread,
        otherThreads,
        selected,
        setSelected,
        selectList,
        setSelectList,
        getOtherThreads,
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}

export function useThread() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error('useThread must be used within a ThreadProvider');
  }
  return context;
}