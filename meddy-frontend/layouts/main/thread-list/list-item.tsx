'use client'
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Popover, Tooltip } from 'antd';
import { useThread } from '@/contexts/ThreadContext';
import { useModal } from '@/contexts/ModalContext';
import { Button, message, Popconfirm } from 'antd';
import { useSettings } from '@/contexts/SettingContext'

export default function ListItem({ thread_id, title, mutil_expert }) {
  const router = useRouter();
  const threadsData = useThread();
  const modaldata = useModal();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { isMobile, collapsed, toggleCollapsed } = useSettings()

  const handleItemClick = () => {
    if (threadsData.threadId === thread_id) {
      return;
    }
    if (isMobile) {
      toggleCollapsed()
    }
    router.push(`/chat/${thread_id}`);
  };

  const handleEdit = () => {
    // e.stopPropagation();
    setPopoverOpen(false);
    setTimeout(() => {
      modaldata.changeTitleModal(true, title, thread_id);
    }, 60);
  };
  const cancel = () => {
    setPopoverOpen(false);
  };
  const handleDelete = async (e) => {
    setPopoverOpen(false);
    // TODO: Add confirmation dialog
    try {
      await threadsData.deleteThread(thread_id, () => {
        threadsData.setThreadId('');
        // dispatchdata.resetChat();
        window.history.pushState({}, "", '/');
      });
    } catch (error) {
      console.error('Failed to delete thread:', error);
    }
  };

  const actionMenu = (
    <div className="list-action-menu">
      <div className="menu-item" onClick={handleEdit}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        编辑
      </div>
      <Popconfirm
        title="删除对话"
        description="删除对话后将无法恢复，是否继续？"
        onConfirm={handleDelete}
        onCancel={cancel}
        okText="确定"
        cancelText="取消"
      >
      <div className="menu-item delete" >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        删除
      </div>
      </Popconfirm>
    </div>
  );
  const isExpert = useMemo(() => {
    if (mutil_expert) {
      return Object.keys(mutil_expert).length > 0;
    }
    return false;
  }, [mutil_expert]);
  return (
    <div
      className={`chat-list-item ${threadsData.threadId === thread_id ? 'active' : ''}`}
    >
      {isExpert && (
        <Tooltip title="咨询中" placement="rightTop">
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12101" width="24" height="24"><path d="M630.568421 296.421053a53.894737 53.894737 0 1 1 0 107.789473 53.894737 53.894737 0 0 1 0-107.789473z m-188.631579 0a53.894737 53.894737 0 1 1 0 107.789473 53.894737 53.894737 0 0 1 0-107.789473z m-188.631579 0a53.894737 53.894737 0 1 1 0 107.789473 53.894737 53.894737 0 0 1 0-107.789473z" fill="#979797" p-id="12102"></path><path d="M377.263158 808.421053c-11.264 0-21.557895-5.389474-26.947369-14.120421l-104.124631-161.522527c-7.868632-12.934737-2.640842-29.103158 11.856842-36.378947 14.389895-7.275789 32.768-3.072 41.391158 9.539368L377.263158 726.501053l77.824-120.616421c8.623158-12.611368 26.947368-16.815158 41.445053-9.539369 14.443789 7.275789 19.671579 23.444211 11.856842 36.378948l-104.232421 161.522526c-5.389474 8.677053-15.683368 14.066526-26.893474 14.120421z" fill="#979797" p-id="12103"></path><path d="M485.914947 636.550737c-14.389895 0-26.085053-12.449684-26.085052-27.809684 0-15.413895 11.695158-27.863579 26.085052-27.863579h208.626527c34.061474 0 61.763368-28.348632 61.763368-63.110737V199.572211a62.517895 62.517895 0 0 0-61.763368-63.056843H167.774316a62.517895 62.517895 0 0 0-61.763369 63.056843v318.194526c0 34.762105 27.701895 63.110737 61.763369 63.110737h104.555789c14.389895 0 26.085053 12.449684 26.085053 27.863579 0 15.36-11.695158 27.809684-26.085053 27.809684h-104.555789C104.986947 636.550737 53.894737 583.302737 53.894737 517.766737V199.572211C53.894737 134.197895 104.986947 80.842105 167.774316 80.842105h526.767158c62.787368 0 113.879579 53.301895 113.879579 118.730106v318.194526c0 65.536-51.092211 118.784-113.879579 118.784H485.914947z m131.072 304.181895a26.408421 26.408421 0 0 1-12.234105-11.910737l-89.842526-166.265263a29.480421 29.480421 0 0 1-0.10779-27.917474 25.815579 25.815579 0 0 1 22.63579-14.012632c9.323789 0.053895 17.946947 5.389474 22.635789 14.120421l67.530106 124.874106 67.530105-124.874106a26.300632 26.300632 0 0 1 15.791158-12.988631 24.576 24.576 0 0 1 19.833263 2.802526 27.648 27.648 0 0 1 12.126316 16.869053 29.480421 29.480421 0 0 1-2.640842 21.126737l-89.842527 166.265263a25.653895 25.653895 0 0 1-22.797473 14.336 24.360421 24.360421 0 0 1-10.617264-2.425263z" fill="#979797" p-id="12104"></path><path d="M848.680421 770.694737h-111.562105a28.079158 28.079158 0 0 1-27.701895-28.510316c0-15.683368 12.395789-28.456421 27.701895-28.456421h111.562105c36.432842 0 66.021053-27.109053 66.021053-60.416V342.177684c0-24.360421-15.845053-46.241684-40.421053-55.727158a28.779789 28.779789 0 0 1-14.928842-36.217263 27.486316 27.486316 0 0 1 34.438737-17.138526c46.349474 17.946947 76.314947 60.739368 76.314947 109.082947v311.134316c0 64.673684-54.433684 117.382737-121.424842 117.382737z m-320.026947 0H458.859789a28.079158 28.079158 0 0 1-27.701894-28.510316c0-15.683368 12.395789-28.456421 27.701894-28.456421h69.793685c15.306105 0 27.701895 12.773053 27.701894 28.456421 0 15.737263-12.395789 28.510316-27.701894 28.510316z" fill="#979797" p-id="12105"></path></svg>
        </Tooltip>
      )}
      <div className="item-name" onClick={handleItemClick}>{title}</div>
      {
        !isExpert && (
          <Popover
          content={actionMenu}
          trigger="click"
          placement="bottomRight"
          arrow={false}
          open={popoverOpen}
          onOpenChange={(visible) => setPopoverOpen(visible)}
        >
          <div className="item-action" onClick={() => { setPopoverOpen(true)}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" />
              <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" fill="currentColor" />
              <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" fill="currentColor" />
            </svg>
          </div>
        </Popover>
        )
      }
    </div>
  );
}