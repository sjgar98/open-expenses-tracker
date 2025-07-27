import { Tooltip } from '@mui/material';
import { Toolbar, ToolbarButton, type GridSlotProps } from '@mui/x-data-grid';

export interface DataGridToolbarAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    actions: DataGridToolbarAction[];
  }
}

export default function DataGridToolbar(props: GridSlotProps['toolbar']) {
  const { actions } = props;
  return (
    <Toolbar className="gap-2">
      {actions.map((action, index) => (
        <Tooltip key={index} title={action.label}>
          <ToolbarButton onClick={action.onClick} disabled={action.disabled}>
            {action.icon}
          </ToolbarButton>
        </Tooltip>
      ))}
    </Toolbar>
  );
}

