// components/UserTicket.js
import AdminTable from "./AdminTable";
import AdminActions from "./AdminActions";

const UserTicket = ({ users, handleEdit, handleDelete }) => {
  const columns = ["Name", "Email", "Role", "Status"];

  const actions = (user) => (
    <AdminActions
      onEdit={() => handleEdit(user)}
      onDelete={() => handleDelete(user._id)}
    />
  );

  return <AdminTable columns={columns} data={users} actions={actions} />;
};

export default UserTicket;
