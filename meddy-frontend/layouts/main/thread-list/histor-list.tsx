import { useMemo } from 'react';
import ListItem from './list-item';

export type HistorListProps = {
  title: string;
  data: any[];
  ffilterType: 'today' | 'thisWeek' | 'earlier';
}
// 根据created_at字段进行过滤；时间格式为 "2025-03-25T08:14:41.408368+00:00"；过滤条件为今天、本周、更早；
// 今天：created_at字段的日期为当天；
// 本周：created_at字段的日期为本周；
// 更早：created_at字段的日期为更早；
// type为today、thisWeek、earlier；
// 返回过滤后的数据；
function filterData(data: any[], type: 'today' | 'thisWeek' | 'earlier') {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  return data.filter((item) => {
    const itemDate = new Date(item.created_at);
    
    switch (type) {
      case 'today':
        return itemDate >= today;
      case 'thisWeek':
        return itemDate >= weekStart && itemDate < today;
      case 'earlier':
        return itemDate < weekStart;
      default:
        return true;
    }
  });
}

export default function HistorList({ title, data, ffilterType }: HistorListProps) {
  const tmp = useMemo(() => {
    return filterData(data, ffilterType);
  }, [data, ffilterType]);

  if (tmp.length === 0) {
    return null;
  }
  return (
    <div className="list">
      <div className="listtitle">{title}</div>
      <div className="listcontent">
        {tmp.map(((item) => <ListItem key={item.thread_id} mutil_expert={item.metadata.mutil_expert} thread_id={item.thread_id} title={item.metadata.title} />))}
      </div>
    </div>
  );
}