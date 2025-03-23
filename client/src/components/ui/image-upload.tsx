import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadIcon, XIcon, ImageIcon } from "lucide-react";
import { isValidImageUrl } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, className, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(value || "");
  const [previewUrl, setPreviewUrl] = useState(value || "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Create a FormData object
      const formData = new FormData();
      formData.append("file", file);

      // Upload the image
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      if (data.url) {
        // Use a timestamp to force image reload if the URL is the same
        const imageUrlWithCache = `${data.url}?t=${new Date().getTime()}`;
        setImageUrl(data.url);
        setPreviewUrl(imageUrlWithCache);
        onChange(data.url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Only update the preview and parent component if the URL is valid
    if (url === "" || isValidImageUrl(url)) {
      setPreviewUrl(url);
      onChange(url);
      setUploadError(null);
    } else {
      setUploadError("Please enter a valid image URL");
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setPreviewUrl("");
    onChange("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      
      <div className="space-y-4">
        {/* Image Preview */}
        <div className="border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center h-40">
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={previewUrl} 
                alt="Preview"
                className="w-full h-full object-contain"
                onError={() => {
                  setUploadError("Failed to load image. The URL may be invalid.");
                  setPreviewUrl("");
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-gray-400 flex flex-col items-center justify-center">
              <ImageIcon className="h-12 w-12 mb-2" />
              <span className="text-sm">No image selected</span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">or</div>
            <Input
              type="text"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={handleUrlChange}
              className="flex-1"
            />
          </div>

          {uploadError && (
            <p className="text-sm text-red-500 mt-1">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}