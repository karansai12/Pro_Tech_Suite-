"use client";

import { Button } from "@/components/ui/button";
import { AllCommunityModule, type ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStore from "@/lib/store";
import { AG_HEADER_HEIGHT, AG_ROW_HEIGHT, agTableHeight } from "@/lib/ag-table";

const modules = [AllCommunityModule];

type TaskStatus = "OPEN" | "INPROGRESS" | "COMPLETED";

type TaskRow = {
  id: string;
  taskName: string;
  taskDescription: string;
  dueDate: string;
  status: TaskStatus;
  assignedTo: string;
  projectId: string;
  assignee: {
    id: string;
    firstName: string;
  };
};

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: "OPEN", value: "OPEN" },
  { label: "IN PROGRESS", value: "INPROGRESS" },
  { label: "COMPLETED", value: "COMPLETED" },
];

function TaskTable() {
  const { role, id: userId } = useStore((state) => state.user);
  const router = useRouter();
  const [rowData, setRowData] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canChangeStatus = useCallback(
    (task: TaskRow) => role === "MANAGER" || task.assignedTo === userId,
    [role, userId],
  );

  const handleStatusChange = useCallback(
    async (taskId: string, status: TaskStatus) => {
      try {
        const response = await fetch("/api/task", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, status }),
        });
        if (!response.ok) {
          throw new Error("Failed to update status");
        }
        setRowData((rows) =>
          rows.map((row) => (row.id === taskId ? { ...row, status } : row)),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update status",
        );
        console.error(err);
      }
    },
    [],
  );

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch("/api/task", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setRowData((rows) => rows.filter((row) => row.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/taskTable");

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }
        const data = await response.json();
        setRowData(data.tasks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const colDefs = useMemo<ColDef<TaskRow>[]>(() => {
    const columns: ColDef<TaskRow>[] = [
      {
        field: "taskName",
        headerName: "Task Title",
        sortable: true,
        filter: true,
      },
      {
        field: "taskDescription",
        headerName: "Task Description",
        sortable: true,
        filter: true,
      },
      {
        field: "assignee.firstName",
        headerName: "Assigned To",
        sortable: true,
        filter: true,
      },
      {
        field: "dueDate",
        headerName: "Due Date",
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          const v = params.value;
          if (!v) return "";
          const d = new Date(v);
          return d.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        field: "status",
        headerName: "Status",
        sortable: true,
        filter: true,
        minWidth: 160,
      },
      {
        field: "projectId",
        headerName: "Project ID",
        sortable: true,
        filter: true,
      },
    ];

    if (role === "MANAGER") {
      columns.push({
        headerName: "Actions",
        sortable: false,
        filter: false,
        minWidth: 180,
        cellRenderer: (params: { data?: TaskRow }) => {
          if (!params.data) return null;
          return (
            <div className="flex flex-row justify-center items-center gap-2">
              <Button
                onClick={() =>
                  router.push(`/task-page?id=${params.data!.id}`)
                }
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(params.data!.id)}
              >
                Delete
              </Button>
            </div>
          );
        },
      });
    }

    return columns;
  }, [canChangeStatus, handleStatusChange, role, router]);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold flex flex-row justify-between">
        Tasks
        {role === "EMPLOYEE" ? null : <Button onClick={() => router.push("/task-page")}>Create Task</Button>}
      </h1>
      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && rowData.length === 0 && role === "EMPLOYEE" ? (
        <h2 className="text-muted-foreground text-2xl">No task assigned to you</h2>
      ) : null}

      {!loading && !error && (rowData.length > 0 || role !== "EMPLOYEE") && (
        <div
          className="w-full overflow-hidden rounded-md border border-border bg-background text-foreground"
          style={{ height: agTableHeight(rowData.length) }}
        >
          <AgGridReact
            modules={modules}
            rowData={rowData}
            columnDefs={colDefs}
            headerHeight={AG_HEADER_HEIGHT}
            rowHeight={AG_ROW_HEIGHT}
            containerStyle={{ height: "100%", width: "100%" }}
            defaultColDef={{
              flex: 1,
              minWidth: 140,
              sortable: true,
              filter: true,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default TaskTable;
