import React, { useEffect, useRef, useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import Sidebar from "./external/editor/components/sidebar";
import { Code } from "./external/editor/editor/code";
import styled from "@emotion/styled";
import { File, buildFileTree, RemoteFile } from "./external/editor/utils/file-manager";
import { FileTree } from "./external/editor/components/file-tree";

interface EditorProps {
  roomId: string;
  userId: string;
}

export const Editor: React.FC<EditorProps> = ({ roomId, userId }) => {
  const [code, setCode] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io('ws://localhost:3001', {
      query: { roomId, userId }
    });

    // Handle incoming changes
    socketRef.current.on('code-change', (newCode: string) => {
      if (editorRef.current) {
        const currentValue = editorRef.current.getValue();
        if (currentValue !== newCode) {
          setCode(newCode);
        }
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, userId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value && socketRef.current) {
      socketRef.current.emit('code-change', { roomId, code: value });
    }
  };

  return (
    <div className="editor-container">
      <MonacoEditor
        height="90vh"
        defaultLanguage="javascript"
        value={code}
        onChange={handleEditorChange}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
};

const Main = styled.main`
  display: flex;
`;