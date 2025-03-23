import { Button } from "@/components/ui/button";
import { 
  ArrowLeftIcon, 
  SaveIcon, 
  EyeIcon, 
  DownloadIcon, 
  FilesIcon
} from "lucide-react";

interface EditorToolbarProps {
  isEditing: boolean;
  catalogName: string;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
}

export default function EditorToolbar({
  isEditing,
  catalogName,
  onBack,
  onSave,
  onPreview,
}: EditorToolbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2 h-14">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-800">
          {isEditing ? `Edit Catalog: ${catalogName}` : "New Catalog"}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 mr-2">Auto-saved</span>
        <Button variant="outline" size="sm" onClick={onPreview}>
          <EyeIcon className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" size="sm">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" size="sm">
          <FilesIcon className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button size="sm" onClick={onSave}>
          <SaveIcon className="h-4 w-4 mr-2" />
          {isEditing ? "Update" : "Save"}
        </Button>
      </div>
    </header>
  );
}
