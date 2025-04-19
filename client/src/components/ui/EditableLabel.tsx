import { useState, useEffect } from "react";
import { PencilIcon } from "lucide-react";
import { useLabels } from "@/hooks/use-labels";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditableLabelProps {
  labelKey: string;
  defaultText: string;
  className?: string;
  isAdmin?: boolean;
}

export function EditableLabel({ 
  labelKey, 
  defaultText, 
  className = "",
  isAdmin = false 
}: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultText);
  const { toast } = useToast();
  const labels = useLabels();
  
  // Update text when settings are loaded or changed
  useEffect(() => {
    if (labels.data?.product && labels.data.product[labelKey]) {
      setText(labels.data.product[labelKey]);
    } else {
      setText(defaultText);
    }
  }, [labels.data, labelKey, defaultText]);
  
  // Handle save
  const handleSave = async () => {
    try {
      await labels.updateLabel(labelKey, text);
      setIsEditing(false);
      toast({ 
        title: "Label updated", 
        description: "The label has been updated successfully" 
      });
    } catch (error) {
      toast({ 
        title: "Update failed", 
        description: "Failed to update label",
        variant: "destructive"
      });
    }
  };
  
  // If not admin, just return the text
  if (!isAdmin) {
    return <span className={className}>{text}</span>;
  }
  
  if (isEditing) {
    return (
      <div className="inline-flex items-center">
        <Input 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          className="w-auto mr-2 h-8 text-sm" 
          autoFocus
        />
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={labels.isLoading}
          className="h-8 px-2 py-0"
        >
          Save
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => {
            setText(labels.data?.product?.[labelKey] || defaultText);
            setIsEditing(false);
          }}
          className="ml-1 h-8 px-2 py-0"
        >
          Cancel
        </Button>
      </div>
    );
  }
  
  return (
    <div className="group inline-flex items-center">
      <span className={className}>{text}</span>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" 
        onClick={() => setIsEditing(true)}
      >
        <PencilIcon className="h-3 w-3" />
      </Button>
    </div>
  );
}