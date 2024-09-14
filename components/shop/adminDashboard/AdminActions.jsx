// components/AdminActions.js
const AdminActions = ({ onEdit, onDelete }) => {
  return (
    <div className="flex space-x-2">
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        onClick={onEdit}
      >
        Edit
      </button>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
};

export default AdminActions;
