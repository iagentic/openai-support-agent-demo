"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink } from "lucide-react";

export default function SessionPage() {
  const [sessionId, setSessionId] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  const generateSessionId = () => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    const baseUrl = window.location.origin;
    const customerUrl = `${baseUrl}/customer?session=${newSessionId}`;
    const agentUrl = `${baseUrl}/agent?session=${newSessionId}`;
    
    setGeneratedUrl(`
Customer View: ${customerUrl}
Agent View: ${agentUrl}
    `);
  };

  // Auto-generate a session on page load
  useEffect(() => {
    if (!sessionId) {
      generateSessionId();
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Session Management
        </h1>
        
        <div className="space-y-4">
          <Button 
            onClick={generateSessionId}
            className="w-full"
          >
            Generate New Session
          </Button>

          {sessionId && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session ID
                </label>
                <div className="flex gap-2">
                  <Input 
                    value={sessionId} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(sessionId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  URLs for Separate Computers
                </label>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      value={`${window.location.origin}/customer?session=${sessionId}`}
                      readOnly 
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInNewTab(`${window.location.origin}/customer?session=${sessionId}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={`${window.location.origin}/agent?session=${sessionId}`}
                      readOnly 
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInNewTab(`${window.location.origin}/agent?session=${sessionId}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Generate a session ID</li>
                  <li>2. Open the Customer URL on one computer</li>
                  <li>3. Open the Agent URL on another computer</li>
                  <li>4. Both computers will be connected in real-time</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
