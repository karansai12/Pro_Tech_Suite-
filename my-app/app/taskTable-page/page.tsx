"use client";

import { Button } from "@/components/ui/button";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useStore from "@/lib/store";

const modules = [AllCommunityModule];

type TaskStatus = "OPEN" | "INPROGRESS" | "COMPLETED";

type TaskRow = {
  id: string;
  taskName: string;
  taskDescription: string;
  dueDate: string;
  status: TaskStatus;
  projectId: string;
  assignee: {
    firstName: string;
  };
};

function TaskTable() {
const {role} = useStore((state)=>state.user)
  const router = useRouter();
  const [rowData, setRowData] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const colDefs = useMemo(
    () => [
      {
        field: "taskName" as const,
        headerName: "Task Title",
        sortable: true,
        filter: true,
      },
      {
        field: "taskDescription" as const,
        headerName: "Task Description",
        sortable: true,
        filter: true,
      },
      {
        field: "assignee.firstName" as const,
        headerName: "Assigned To",
        sortable: true,
        filter: true,
      },
      {
        field: "dueDate" as const,
        headerName: "Due Date",
        sortable: true,
        filter: true,
        valueFormatter: (params: { value: string }) => {
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
      { field: "status" as const, headerName: "Status", sortable: true, filter: true },
      {
        field: "projectId" as const,
        headerName: "Project ID",
        sortable: true,
        filter: true,
      },
    ],
    [],
  );

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold flex flex-row justify-between">
        Tasks
        {role === "EMPLOYEE" ? null : <Button onClick={() => router.push("/task-page")}>Create Task</Button>}
      </h1>
      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div style={{ height: 500 }} className="rounded-md border">
          <AgGridReact
            modules={modules}
            rowData={rowData}
            columnDefs={colDefs}
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
