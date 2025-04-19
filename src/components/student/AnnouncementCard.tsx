'use client';
import { formatDistanceToNow } from 'date-fns';

interface AnnouncementCardProps {
  title: string;
  content: string;
  createdAt: string | Date;
  author?: string;
  icon?: React.ReactNode;
}

export default function AnnouncementCard({ 
  title, 
  content, 
  createdAt, 
  author,
  icon 
}: AnnouncementCardProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: false });
  
  return (
    <div className="border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-3 text-blue-600">
          {icon || '📢'}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-500">{author || 'Admin'} has uploaded a new {title.toLowerCase()}.</p>
        </div>
        <span className="text-sm text-gray-400">{timeAgo} ago</span>
      </div>
      {content && (
        <p className="text-sm text-gray-600 ml-11">{content}</p>
      )}
    </div>
  );
} 