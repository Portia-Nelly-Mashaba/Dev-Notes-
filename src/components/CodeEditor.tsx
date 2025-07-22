import { Editor } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

export const CodeEditor = ({ 
  value, 
  onChange, 
  language, 
  height = "300px",
  readOnly = false 
}: CodeEditorProps) => {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <Card className="overflow-hidden">
      <Editor
        height={height}
        language={language.toLowerCase()}
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          readOnly,
          fontSize: 14,
          minimap: { enabled: false },
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </Card>
  );
};