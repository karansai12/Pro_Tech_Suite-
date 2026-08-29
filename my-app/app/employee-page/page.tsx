"use client";

import { AllCommunityModule } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useStore from "@/lib/store";

const modules = [AllCommunityModule];

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

const EmployeePage = () => {
  const router = useRouter();
  const { role } = useStore((state) => state.user);
  const [rowData, setRowData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role === "EMPLOYEE") {
      router.replace("/taskTable-page");
      return;
    }

    if (role !== "MANAGER") {
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error("Failed to load users");
        }

        const data = await response.json();
        setRowData(data.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role, router]);

  const colDefs = useMemo(
    () => [
      { field: "firstName" as const, headerName: "First Name", sortable: true, filter: true },
      { field: "lastName" as const, headerName: "Last Name", sortable: true, filter: true },
      { field: "email" as const, sortable: true, filter: true },
      { field: "role" as const, sortable: true, filter: true },
    ],
    []
  );

  if (role === "EMPLOYEE") {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Employee</h1>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div style={{ height: 500 }} className="rounded-md border">
          <AgGridReact
            modules={modules}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={{ flex: 1, minWidth: 140, sortable: true, filter: true }}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeePage;
