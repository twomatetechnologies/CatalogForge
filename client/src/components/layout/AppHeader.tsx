import { User } from "@/types";
import { getInitials } from "@/lib/utils";
import { BellIcon, HelpCircleIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">{user.name}</span>
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
              {getInitials(user.name)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}