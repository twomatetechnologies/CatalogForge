import { CatalogItem } from "@/types";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { XIcon } from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";

interface CanvasDropzoneProps {
  pageSize: string;
  orientation: string;
  items: CatalogItem[];
  onRemoveItem: (id: string) => void;
}

export default function CanvasDropzone({
  pageSize,
  orientation,
  items,
  onRemoveItem,
}: CanvasDropzoneProps) {
  // Get page dimensions based on size and orientation
  const getPageDimensions = () => {
    // A4 dimensions in pixels (96 dpi): 794 x 1123
    let width = 595;
    let height = 842;

    switch (pageSize) {
      case "Letter":
        width = 612;
        height = 792;
        break;
      case "A5":
        width = 420;
        height = 595;
        break;
      default: // A4
        width = 595;
        height = 842;
        break;
    }

    // Swap dimensions for landscape
    if (orientation === "landscape") {
      return { width: height, height: width };
    }

    return { width, height };
  };

  const { width, height } = getPageDimensions();

  return (
    <div
      className="bg-white shadow-lg relative"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <Droppable droppableId="canvas">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`absolute inset-0 p-8 ${
              snapshot.isDraggingOver ? "bg-primary-50" : ""
            }`}
            style={{ minHeight: "100%" }}
          >
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <div className="h-10 w-32 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                Business Logo
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Catalog Title</h1>
            </div>
            
            {/* Items Grid */}
            <div className="grid grid-cols-2 gap-4">
              {items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`border border-gray-200 rounded-lg p-3 relative group ${
                        snapshot.isDragging ? "shadow-lg" : ""
                      }`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                      >
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      
                      <button
                        className="absolute top-1 right-1 p-1 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                      
                      {item.type === "product" && <ProductCard product={item.content} />}
                      {item.type === "text" && <div className="text-sm">{item.content}</div>}
                      {item.type === "image" && (
                        <div className="aspect-w-3 aspect-h-2 bg-gray-100 rounded">
                          <img
                            src={item.content}
                            alt="Custom image"
                            className="object-cover w-full h-full rounded"
                            onError={(e) => {
                              e.currentTarget.src = "https://placehold.co/200x150?text=Image+Error";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              
              {/* Empty grid items as placeholders */}
              {items.length < 4 &&
                Array.from({ length: 4 - items.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="border border-dashed border-gray-200 rounded-lg p-3 h-[250px] flex items-center justify-center"
                  >
                    <div className="text-center text-gray-400 text-sm">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="mt-1">Drag product here</p>
                    </div>
                  </div>
                ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
