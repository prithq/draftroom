// apps/web/components/CodeEditor.tsx
"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ language, value, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      width="100%"
      language={language}
      value={value}
      onChange={(newValue) => onChange(newValue || "")}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "JetBrains Mono, monospace",
        lineNumbers: "on",
        readOnly: readOnly,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        bracketPairColorization: { enabled: true },
        scrollBeyondLastLine: false,
        renderWhitespace: "selection",
        formatOnPaste: true,
        formatOnType: true,
        suggest: {
          showKeywords: true,
          showFunctions: true,
          showVariables: true,
        },
      }}
    />
  );
}