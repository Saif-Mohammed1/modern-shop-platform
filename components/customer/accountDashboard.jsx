"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import api from "../util/axios.api";

// const AccountDashboard = () => {
//   const { user } = useContext(UserContext);

//   const [isEditing, setIsEditing] = useState({
//     name: false,
//     email: false,
//     phone: false,
//   });

//   const [userData, setUserData] = useState({
//     ...user,
//     password: "********",
//   });

//   const [formData, setFormData] = useState({
//     name: userData.name,
//     email: userData.email,
//     phone: userData.phone,
//   });

//   const handleEditClick = (field) => {
//     setIsEditing((prevState) => ({
//       ...prevState,
//       [field]: !prevState[field],
//     }));
//   };

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSave = (field) => {
//     setUserData({
//       ...userData,
//       [field]: formData[field],
//     });
//     setIsEditing((prevState) => ({
//       ...prevState,
//       [field]: false,
//     }));
//   };

//   //   const handelApplyChanges = async() => {
//   // if ()

//   //   }
//   return (
//     <div className="w-full max-w-3xl /mx-auto bg-white p-8 shadow-lg rounded-lg">
//       <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

//       {/* Name Field */}
//       <div className="mb-6">
//         <label className="block text-gray-700 font-medium mb-2">Name:</label>
//         <div className="flex items-center justify-between">
//           <span>{userData.name}</span>
//           <button
//             onClick={() => handleEditClick("name")}
//             className="text-blue-500 hover:text-blue-700 font-medium"
//           >
//             {isEditing.name ? "Cancel" : "Edit"}
//           </button>
//         </div>
//         {isEditing.name && (
//           <div className="mt-2">
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               className="border rounded px-3 py-2 w-full mt-1"
//             />
//             <button
//               onClick={() => handleSave("name")}
//               className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//             >
//               Save
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Email Field */}
//       <div className="mb-6">
//         <label className="block text-gray-700 font-medium mb-2">Email:</label>
//         <div className="flex items-center justify-between">
//           <span>
//             {userData.email}{" "}
//             {userData.emailVerify ? (
//               <span className="text-green-500">(verified)</span>
//             ) : (
//               <span className="text-red-500">(not verified)</span>
//             )}
//           </span>
//           <button
//             onClick={() => handleEditClick("email")}
//             className="text-blue-500 hover:text-blue-700 font-medium"
//           >
//             {isEditing.email ? "Cancel" : "Edit"}
//           </button>
//         </div>
//         {isEditing.email && (
//           <div className="mt-2">
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               className="border rounded px-3 py-2 w-full mt-1"
//             />
//             <button
//               onClick={() => handleSave("email")}
//               className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//             >
//               Save
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Mobile Field */}
//       <div className="mb-6">
//         <label className="block text-gray-700 font-medium mb-2">
//           Mobile Number:
//         </label>
//         <div className="flex items-center justify-between">
//           <span>{userData.phone}</span>
//           <button
//             onClick={() => handleEditClick("phone")}
//             className="text-blue-500 hover:text-blue-700 font-medium"
//           >
//             {isEditing.phone ? "Cancel" : "Edit"}
//           </button>
//         </div>
//         {isEditing.phone && (
//           <div className="mt-2">
//             <input
//               type="text"
//               name="phone"
//               value={formData.phone}
//               onChange={handleInputChange}
//               className="border rounded px-3 py-2 w-full mt-1"
//             />
//             <button
//               onClick={() => handleSave("phone")}
//               className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//             >
//               Save
//             </button>
//           </div>
//         )}
//       </div>

//       <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
//         apply changes
//       </button>
//     </div>
//   );
// };

const AccountDashboardV2 = () => {
  const { data: session, update } = useSession();

  //   const { user } = useContext(UserContext); // Assuming these methods exist in your UserContext

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
  });

  const [userData, setUserData] = useState({
    // ...user,
    ...session?.user,
    // password: "********",
  });

  const [formData, setFormData] = useState({
    name: userData.name,
    phone: userData.phone,
  });
  const [changeEmail, setChangeEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [showTokenField, setShowTokenField] = useState(false);
  const [isVerified, setIsVerified] = useState(userData.emailVerify);
  const [changesApplied, setChangesApplied] = useState(false);

  const handleEditClick = (field) => {
    setIsEditing((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = (field) => {
    setUserData({
      ...userData,
      [field]: formData[field],
    });
    setIsEditing((prevState) => ({
      ...prevState,
      [field]: false,
    }));
    setChangesApplied(true); // Mark changes as applied
  };

  const handleApplyChanges = async () => {
    let loadingToast;
    let updatedData = {};
    if (changesApplied) {
      Object.entries(formData).forEach(([key, value]) => {
        if (formData[key] !== session?.user[key]) {
          updatedData[key] = value;
        }
      });

      try {
        toast.loading("Applying changes...");
        const { data } = await api.put("/customer/update-data", updatedData);

        await update({
          ...session,
          user: {
            ...session?.user,
            ...data.data,
          },
        });
        toast.dismiss(loadingToast);
        toast.success("User data updated successfully!");
        setChangesApplied(false); // Reset after applying changes
      } catch (error) {
        toast.dismiss(loadingToast);

        toast.error(error?.message || error || "Failed to update user data!");
      }
    }
  };

  const handleSendVerificationLink = async () => {
    // Call your context function to send email verification link
    let loadingToast;
    try {
      loadingToast = toast.loading("Sending verification link...");
      await api.get("/customer/update-data/verify-email");
      toast.dismiss(loadingToast);
      toast.success("Email verification link sent!");
      setShowTokenField(true);
    } catch (error) {
      toast.dismiss(loadingToast);

      toast.error(
        error?.message || error || "Failed to send verification link!"
      );
    }
  };

  const handleVerifyToken = async () => {
    let loadingToast;
    try {
      loadingToast = toast.loading("Sending verification link...");
      await api.put("/customer/update-data/verify-email", {
        verificationCode: verificationToken,
      });
      toast.dismiss(loadingToast);
      toast.success("Email verified successfully!");

      await update({
        ...session,
        user: {
          ...session?.user,
          emailVerify: true,
        },
      });
      setShowTokenField(false);
    } catch (error) {
      toast.dismiss(loadingToast);

      toast.error(error?.message || error || "Failed to verify email!");
    }
  };
  const handleEmailChange = async () => {
    try {
      await api.post("/customer/update-data/change-email", {
        newEmail: changeEmail,
      });
      setUserData((prevState) => ({
        ...prevState,
        email: changeEmail,
      }));
      setIsEditing((prevState) => ({
        ...prevState,
        email: false,
      }));
      toast.success(
        "we have sent you a verification link to your old email please check it for confirmation"
      );
      setChangeEmail("");
    } catch (error) {
      toast.error(error?.message || error || "Failed to change email!");
    }
  };
  return (
    <div className="w-full max-w-3xl /mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      {/* Name Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Name:</label>
        <div className="flex items-center justify-between">
          <span>{userData.name}</span>
          <button
            onClick={() => handleEditClick("name")}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing.name ? "Cancel" : "Edit"}
          </button>
        </div>
        {isEditing.name && (
          <div className="mt-2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border rounded px-3 py-2 w-full mt-1"
            />
            <button
              onClick={() => handleSave("name")}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Email Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Email:</label>
        <div className="flex items-center justify-between">
          <span>
            {userData.email}{" "}
            {isVerified ? (
              <span className="text-green-500">(verified)</span>
            ) : (
              <span className="text-red-500">(not verified)</span>
            )}
          </span>
          <button
            onClick={() => handleEditClick("email")}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing.email ? "Cancel" : "Edit"}
          </button>
        </div>
        {isEditing.email && (
          <div className="mt-2">
            <input
              type="email"
              name="email"
              value={changeEmail}
              onChange={(e) => setChangeEmail(e.target.value)}
              className="border rounded px-3 py-2 w-full mt-1"
            />
            <button
              onClick={handleEmailChange}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Update
            </button>
          </div>
        )}
        {!isVerified && (
          <div className="mt-4">
            <button
              onClick={handleSendVerificationLink}
              className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Send Verification Link
            </button>
          </div>
        )}
        {showTokenField && (
          <div className="mt-4">
            <label>Enter Verification Token:</label>
            <input
              type="text"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              className="border rounded px-3 py-2 w-full mt-1"
            />
            <button
              onClick={handleVerifyToken}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Verify Email
            </button>
          </div>
        )}
      </div>

      {/* Mobile Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Mobile Number:
        </label>
        <div className="flex items-center justify-between">
          <span>{userData.phone || "*********"}</span>
          <button
            onClick={() => handleEditClick("phone")}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing.phone ? "Cancel" : "Edit"}
          </button>
        </div>
        {isEditing.phone && (
          <div className="mt-2">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="border rounded px-3 py-2 w-full mt-1"
            />
            <button
              onClick={() => handleSave("phone")}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleApplyChanges}
        className={`mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${
          !changesApplied ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!changesApplied}
      >
        Apply Changes
      </button>
    </div>
  );
};

export default AccountDashboardV2;
