import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import axios from "axios";

const Table = () => {
  const [data, setData] = useState([
    { id: 1, title: "Task 1", completed: false },
    { id: 2, title: "Task 2", completed: true },
  ]);

  const [filter, setFilter] = useState("All"); // State for the filter

  useEffect(() => {
    async function getData() {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/todos`
      );
      setData(response.data.slice(0, 20));
    }
    getData();
  }, []);

  const filteredData = useMemo(() => {
    if (filter === "All") return data;
    if (filter === "To Do") return data.filter((row) => row.completed === false);
    if (filter === "Done") return data.filter((row) => row.completed === true);
    if (filter === "In Progress")
      return data.filter((row) => row.completed === "In Progress");
    return data;
  }, [data, filter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ getValue, row }) => (
          <input
            value={getValue() || ""}
            onChange={(e) => updateData(row.index, "title", e.target.value)}
          />
        ),
      },
      {
        accessorKey: "completed",
        header: "Status",
        cell: ({ getValue, row }) => {
          const value = getValue();
          return (
            <select
              value={value === true ? "Done" : value === false ? "To Do" : "In Progress"}
              onChange={(e) => {
                let newValue;
                if (e.target.value === "Done") newValue = true;
                else if (e.target.value === "To Do") newValue = false;
                else newValue = "In Progress";
                updateData(row.index, "completed", newValue);
              }}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button onClick={() => deleteRow(row.index)}>Delete</button>
        ),
      },
    ],
    []
  );

  const updateData = (rowIndex, columnId, value) => {
    setData((oldData) =>
      oldData.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  const deleteRow = (rowIndex) => {
    setData((oldData) => oldData.filter((_, index) => index !== rowIndex));
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div>
        <label htmlFor="statusFilter">Filter by Status: </label>
        <select
          id="statusFilter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <button
        onClick={() =>
          setData([...data, { id: data.length + 1, title: "New Task", completed: false }])
        }
      >
        Add Task
      </button>
      <table border="1">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


function App() {
  return (
    <>
      <div>
        <h1>App</h1>
        <Table />
      </div>
    </>
  );
}

export default App;
