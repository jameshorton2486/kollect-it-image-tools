
import React, { FC, ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
  isLast?: boolean;
}

interface StepsProps {
  children: ReactNode;
  currentStep?: number;
  className?: string;
}

export const Step: FC<StepProps> = ({
  title,
  description,
  icon,
  isCompleted = false,
  isActive = false,
  isLast = false,
}) => {
  return (
    <div className={cn("flex", !isLast && "after:content-[''] after:w-full after:h-0.5 after:border-b after:border-gray-200 after:border-dashed after:flex-1 after:mt-3.5")}>
      <div className="flex flex-col items-center relative">
        <div className={cn(
          "rounded-full w-7 h-7 flex items-center justify-center border",
          isCompleted ? "bg-green-500 border-green-500" : isActive ? "border-primary" : "border-gray-300"
        )}>
          {isCompleted ? (
            <CheckCircle className="text-white w-5 h-5" />
          ) : (
            icon || (
              <span className={cn("text-sm font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {title.charAt(0)}
              </span>
            )
          )}
        </div>
        <div className="text-center mt-2">
          <p className={cn("font-medium", isActive ? "text-primary" : "text-gray-700")}>{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const Steps: FC<StepsProps> = ({ 
  children,
  currentStep = 1,
  className,
}) => {
  // Convert children to array and count them
  const childArray = React.Children.toArray(children);
  const stepCount = childArray.length;
  
  return (
    <div className={cn("flex w-full justify-between", className)}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        
        return React.cloneElement(child as React.ReactElement<StepProps>, {
          isCompleted: index < currentStep - 1,
          isActive: index === currentStep - 1,
          isLast: index === stepCount - 1,
        });
      })}
    </div>
  );
};
