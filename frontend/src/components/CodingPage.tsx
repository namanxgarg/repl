import React, { useEffect, useState } from 'react';
import { Editor } from './Editor';
import { useParams } from 'react-router-dom';

export const CodingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [userId] = useState(() => 'user-' + Math.random().toString(36).substring(7));

  useEffect(() => {
    // Set up any room-specific initialization here
    console.log(`Joined room: ${roomId} as user: ${userId}`);
  }, [roomId, userId]);

  return (
    <div className="coding-page">
      <header className="coding-header">
        <h1>Replit Clone</h1>
        <div className="room-info">
          Room: {roomId}
          <br />
          User: {userId}
        </div>
      </header>
      <Editor roomId={roomId || 'default'} userId={userId} />
    </div>
  );
};
