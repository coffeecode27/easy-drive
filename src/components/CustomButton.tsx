import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";

interface CustomButtonProps {
  isLoading: boolean;
  className?: string;
  children: React.ReactNode;
}

const CustomtButton = ({ isLoading, children }: CustomButtonProps) => {
  return (
    <Button type="submit" disabled={isLoading}>
      {isLoading ? (
        <div className="flex items-center gap-3">
          <span>Uploading</span>
          <Loader className="animate-spin w-4 h-4" />
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomtButton;
