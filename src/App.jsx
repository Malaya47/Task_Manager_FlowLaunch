import React, { useState, useMemo, useEffect, useRef } from "react";
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

  const [filter, setFilter] = useState("All");
  const [newTaskIndex, setNewTaskIndex] = useState(null); // Track the index of the newly added task
  const taskRefs = useRef([]); // Create a ref to hold references to table rows

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
    if (filter === "To Do")
      return data.filter((row) => row.completed === false);
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
            className="form-control"
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
              className="form-select"
              value={
                value === true
                  ? "Done"
                  : value === false
                  ? "To Do"
                  : "In Progress"
              }
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
          <button
            className="btn btn-danger"
            onClick={() => deleteRow(row.index)}
          >
            Delete
          </button>
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

  const addTaskAndScroll = () => {
    const newIndex = data.length;
    setData([
      ...data,
      { id: newIndex + 1, title: "New Task", completed: false },
    ]);
    setNewTaskIndex(newIndex); // Set the index of the newly added task
  };

  // Scroll to the newly added task
  useEffect(() => {
    if (newTaskIndex !== null && taskRefs.current[newTaskIndex]) {
      taskRefs.current[newTaskIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [newTaskIndex]);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between mb-3">
        <div>
          <label htmlFor="statusFilter">Filter by Status: </label>
          <select
            id="statusFilter"
            className="form-select w-auto"
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
          className="btn btn-primary"
          onClick={addTaskAndScroll} // Add task and trigger scroll
        >
          Add Task
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
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
            {table.getRowModel().rows.map((row, index) => (
              <tr
                ref={(el) => (taskRefs.current[index] = el)} // Assign ref to each row
                key={row.id}
              >
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
    </div>
  );
};

function App() {
  return (
    <>
      <div>
        <h1 className="text-center">Task Manager</h1>
        <Table />
      </div>
    </>
  );
}

export default App;
