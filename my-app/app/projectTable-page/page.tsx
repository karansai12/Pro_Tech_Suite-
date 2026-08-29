"use client";

import { Button } from "@/components/ui/button";
import useStore from "@/lib/store";
import { AG_HEADER_HEIGHT, AG_ROW_HEIGHT, agTableHeight } from "@/lib/ag-table";
import { AllCommunityModule, type ColDef } from "ag-grid-community";
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

  const handleDelete =async(projectId:string)=>{
    try{
      const response = await fetch('/api/project',{
        method:'DELETE',
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({projectId})
      })
      if(!response.ok){
        throw new Error("Failed to delete project");
      }
      setRowData((rows) => rows.filter((row) => row.id !== projectId));
    }catch(err){
      setError(
        err instanceof Error ? err.message : "Failed to delete project",
      );
      console.error(err);
    }
  }

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

  const colDefs = useMemo<ColDef<ProjectRow>[]>(() => {
    const columns: ColDef<ProjectRow>[] = [
      {
        field: "projectTitle",
        headerName: "Project Name",
        sortable: true,
        filter: true,
      },
      {
        field: "projectDescription",
        headerName: "Project Description",
        sortable: true,
        filter: true,
      },
      {
        field: "user.firstName",
        headerName: "Assigned By",
        sortable: true,
        filter: true,
      },
      {
        field: "createdAt",
        headerName: "Created At",
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
    ];

    if (role === "MANAGER") {
      columns.push({
        headerName: "Actions",
        sortable: false,
        filter: false,
        minWidth: 110,
        cellRenderer: (params: { data?: ProjectRow }) => {
          if (!params.data) return null;
          return (
            <div className="flex flex-row justify-center items-center gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDelete(params.data!.id)}
              >
                delete
              </Button>
            </div>
          );
        },
      });
    }

    return columns;
  }, [role]);
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

export default ProjectTable;
