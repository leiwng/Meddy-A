'use client';

import HistorList from './histor-list';
import { useThread } from '@/contexts/ThreadContext';
import { useAuthContext } from '@/auth/hooks'
import { useMemo } from 'react';

export default function ThreadList() {
  const data = useThread();
  const { user } = useAuthContext();

  const userThreads = useMemo(() => {
    if (!user) {
      return [];
    }
    if (user.role === 'expert') {
      return data.selected === 'ai' ? data.userThreads : data.otherThreads
    }
    return data.userThreads
  }, [user, data.selected, data.userThreads, data.otherThreads]);

  return (
    <div className="historylist">
      <HistorList ffilterType="today" title="今天" data={userThreads} />
      <HistorList ffilterType="thisWeek" title="本周" data={userThreads} />
      <HistorList ffilterType="earlier" title="更早" data={userThreads} />
    </div>
  );
}