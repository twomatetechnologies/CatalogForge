import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: Date | string | null): string {
  if (!date) {
    return 'N/A';
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function randomColor(): string {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-yellow-100 text-yellow-700',
    'bg-red-100 text-red-700',
    'bg-indigo-100 text-indigo-700',
    'bg-pink-100 text-pink-700',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateSKU(category: string, id: number): string {
  const prefix = category ? 
    category.substring(0, 3).toUpperCase() : 
    'PRD';
  
  return `${prefix}-${String(id).padStart(4, '0')}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
  const lowercasedUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowercasedUrl.endsWith(ext)) || 
         lowercasedUrl.startsWith('data:image/');
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}
