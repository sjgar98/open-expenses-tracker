export interface DraggableWidgetProps {
  height?: number;
  width?: number;
  id: string;
  index: number;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
  widget: React.ReactNode;
}

export interface WidgetProps {
  height?: number;
  width?: number;
}

export interface DragItem {
  index: number;
  id: string;
  type: string;
}

