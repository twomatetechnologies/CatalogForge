import { User } from "@/types";
import { getInitials } from "@/lib/utils";
import { BellIcon, HelpCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  user: User;
}

export default function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2 h-14">
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 bg-primary-100 rounded-md flex items-center justify-center text-primary-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
            <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-800">Catalog Builder</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <BellIcon className="h-5 w-5 text-gray-500" />
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircleIcon className="h-5 w-5 text-gray-500" />
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">{user.name}</span>
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
            {getInitials(user.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
