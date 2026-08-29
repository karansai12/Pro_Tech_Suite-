"use client";

import { Button } from "@/components/ui/button";
import useStore from "@/lib/store";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const modules = [AllCommunityModule];

type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED";

type ProjectRow = {
  id: string;
  projectTitle: string;
  projectDescription: string;
  status: Status;
  createdAt: string;
  user: {
    firstName: string;
  };
};

function ProjectTable() {
  const {role} =useStore((state)=>state.user)
  const router = useRouter();
  const [rowData, setRowData] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projectTable");

        if (!response.ok) {
          throw new Error("Failed to load projects");
        }
        const data = await response.json();
        setRowData(data.projects || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load projects",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const colDefs = useMemo(
    () => [
      {
        field: "projectTitle" as const,
        headerName: "Project Name",
        sortable: true,
        filter: true,
      },
      {
        field: "projectDescription" as const,
        headerName: "Project Description",
        sortable: true,
        filter: true,
      },
      { field: "status" as const, sortable: true, filter: true },
      {
        field: "user.firstName" as const,
        headerName: "Assigned By",
        sortable: true,
        filter: true,
      },
      {
        field: "createdAt" as const,
        headerName: "Created At",
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
        }
      },
    ],
    [],
  );
  console.log({ rowData });

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold flex flex-row justify-between">
        Projects {role === "EMPLOYEE" ? null : 
          <Button onClick={() => router.push("/project-page")}>Create Project</Button>} 
      </h1>
      {loading && <p>Loading projects...</p>}
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

export default ProjectTable;
