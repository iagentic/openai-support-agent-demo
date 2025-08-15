"use client";
import { useState } from "react";
import AgentView from "@/components/AgentView";
import UserView from "@/components/UserView";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function Main() {
  const [isAgentView, setIsAgentView] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#ED6A5E] p-2">
      {/* Header with session management link */}
      <div className="flex justify-between items-center pt-2 pb-4">
        <div className="flex gap-2 justify-center md:justify-start">
          <div
            className={`text-white font-bold text-sm ${
              isAgentView ? "text-zinc-300" : ""
            }`}
          >
            Customer View
          </div>
          <Switch
            checked={isAgentView}
            onCheckedChange={setIsAgentView}
            className="flex items-center"
            mode="custom"
          />
          <div
            className={`text-white font-bold text-sm ${
              isAgentView ? "" : "text-zinc-300"
            }`}
          >
            Agent View
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="text-white border-white hover:bg-white hover:text-[#ED6A5E]"
          onClick={() => window.open('/session', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Multi-Computer Setup
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex gap-1 mb-8 md:mb-0">
        {/* Left column */}
        <div
          className={`
            w-full md:w-1/4 flex flex-col min-h-0 overflow-hidden
            ${isAgentView ? "hidden md:flex" : ""}
          `}
        >
          <div className="text-white font-bold text-xs text-center pt-1 pb-3 hidden md:block">
            Customer View
          </div>
          <UserView />
        </div>

        {/* Right column */}
        <div
          className={`
            w-full md:w-3/4 flex flex-col min-h-0 overflow-hidden
            ${isAgentView ? "flex" : "hidden md:flex"}
          `}
        >
          <div className="text-white font-bold text-xs text-center pt-1 pb-3 hidden md:block">
            Support Representative View
          </div>
          <AgentView />
        </div>
      </div>
    </div>
  );
}
