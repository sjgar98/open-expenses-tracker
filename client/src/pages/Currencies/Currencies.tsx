import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import { Box, Tooltip, useMediaQuery } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppCurrency } from '../../model/currencies';
import {
  DataGrid,
  GridActionsCellItem,
  GridRowModes,
  Toolbar,
  ToolbarButton,
  type GridPaginationModel,
  type GridColDef,
  type GridRowModesModel,
  type GridRowsProp,
  type GridSlotProps,
  type GridCallbackDetails,
  type GridRowId,
  type GridEventListener,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { useState } from 'react';

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    addNewRow: () => void;
  }
}

function CurrenciesEditToolbar(props: GridSlotProps['toolbar']) {
  const { addNewRow } = props;
  return (
    <Toolbar>
      <Tooltip title="Add record">
        <ToolbarButton onClick={addNewRow}>
          <AddIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
    </Toolbar>
  );
}

export default function Currencies() {
  const { t } = useTranslation();
  const currencies: AppCurrency[] = useSelector((state: any) => state.currencies.currencies);
  const dispatch = useDispatch();

  const [rows, setRows] = useState<GridRowsProp>(currencies);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ pageSize: 25, page: 0 });

  function addNewRow() {
    if (rows[rows.length - 1].code === '') return;
    setRows((oldRows) => [...oldRows, { name: '', code: '', symbol: '', status: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      ['']: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
    setPaginationModel((prev) => ({
      ...prev,
      page: Math.max(0, Math.ceil(rows.length / prev.pageSize) - 1),
    }));
  }

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.code !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.code === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.code !== id));
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', type: 'string', headerName: t('currencies.table.header.name'), flex: 1, editable: true },
    {
      field: 'code',
      type: 'string',
      headerName: t('currencies.table.header.iso'),
      minWidth: 75,
      flex: 0.3,
      editable: true,
    },
    {
      field: 'symbol',
      type: 'string',
      headerName: t('currencies.table.header.symbol'),
      minWidth: 100,
      flex: 0.3,
      editable: true,
    },
    {
      field: 'status',
      type: 'singleSelect',
      headerName: t('currencies.table.header.status'),
      valueOptions: [
        { label: t('status.enabled'), value: true },
        { label: t('status.disabled'), value: false },
      ],
      minWidth: 120,
      flex: 0.3,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: ({ id }) => {
        const isEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        return isEditMode
          ? [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                material={{ sx: { color: 'primary.main' } }}
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ]
          : [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                className="textPrimary"
                onClick={handleEditClick(id)}
                color="inherit"
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(id)}
                color="inherit"
              />,
            ];
      },
    },
  ];

  return (
    <>
      <Header location={t('currencies.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          columns={columns}
          rows={rows}
          rowModesModel={rowModesModel}
          onRowModesModelChange={setRowModesModel}
          onRowEditStop={handleRowEditStop}
          getRowId={(row) => row.code}
          editMode="row"
          slots={{ toolbar: CurrenciesEditToolbar }}
          slotProps={{ toolbar: { addNewRow } }}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          showToolbar
          autoPageSize
        ></DataGrid>
      </Box>
    </>
  );
}
