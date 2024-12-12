import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Table = () => {
  const [data, setData] = useState([]);

  const [filter, setFilter] = useState("All");
  const [searchTitle, setSearchTitle] = useState("");
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
    let filtered = data;

    if (filter !== "All") {
      if (filter === "To Do")
        filtered = filtered.filter((row) => row.completed === false);
      if (filter === "Done")
        filtered = filtered.filter((row) => row.completed === true);
      if (filter === "In Progress")
        filtered = filtered.filter((row) => row.completed === "In Progress");
    }

    if (searchTitle) {
      filtered = filtered.filter((row) =>
        row.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    return filtered;
  }, [data, filter, searchTitle]);

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
    toast.error("Task deleted successfully!", {
      position: "bottom-left",
      autoClose: 3000, // Adjust the time to keep it on screen longer if necessary
      hideProgressBar: false,
      closeOnClick: true, // Enable closing on click
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
    setData((oldData) => oldData.filter((_, index) => index !== rowIndex));
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const addTaskAndScroll = () => {
    toast.success("Task added successfully!", {
      position: "bottom-left",
      autoClose: 3000, // Adjust the time to keep it on screen longer if necessary
      hideProgressBar: false,
      closeOnClick: true, // Enable closing on click
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
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

  const taskCounts = useMemo(() => {
    const counts = {
      all: data.length,
      toDo: data.filter((task) => task.completed === false).length,
      inProgress: data.filter((task) => task.completed === "In Progress")
        .length,
      done: data.filter((task) => task.completed === true).length,
    };
    return counts;
  }, [data]);

  return (
    <div className="container my-4">
      <ToastContainer />
      <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-center gap-2">
          <label htmlFor="statusFilter" className="form-label mb-0">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="flex-grow-1">
          <input
            onChange={(e) => setSearchTitle(e.target.value)}
            type="search"
            placeholder="Search by title"
            className="form-control"
          />
        </div>
        <div>
          <button
            className="btn btn-primary w-100 w-md-auto"
            onClick={addTaskAndScroll}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task Counters */}
      <div className="mb-3">
        <h5 className="mb-3 text-center">Task Counters</h5>
        <div className="row text-center gy-2">
          <div className="col-6 col-md-3">
            <div className="p-2 bg-light rounded shadow-sm">
              <strong>Total Tasks:</strong>
              <p className="m-0 fs-5">{taskCounts.all}</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 bg-primary text-white rounded shadow-sm">
              <strong>To Do:</strong>
              <p className="m-0 fs-5">{taskCounts.toDo}</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 bg-warning text-dark rounded shadow-sm">
              <strong>In Progress:</strong>
              <p className="m-0 fs-5">{taskCounts.inProgress}</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 bg-success text-white rounded shadow-sm">
              <strong>Done:</strong>
              <p className="m-0 fs-5">{taskCounts.done}</p>
            </div>
          </div>
        </div>
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
