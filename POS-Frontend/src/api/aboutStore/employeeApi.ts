import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/employee";

export const getEmployeesByManager = async (token: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return response.data; // Axios คืนค่า response.data โดยตรง
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch employees");
    }
};
export const addEmployee = async (employee: {
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  position: string;
}, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/register`,
      employee,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 201) {
      return { success: true, message: "Employee added successfully" };
    } else {
      return { success: false, message: "Failed to add employee" };
    }
  } catch (error) {
    console.error("Error adding employee:", error);
    return { success: false, message: "Error adding employee" };
  }
};

export const updateEmployee = async (employeeId: string, updatedEmployeeData: {
  email?: string;
  username?: string;
  phoneNumber?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
}, token: string) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/${employeeId}`, // Assuming the API requires employeeId in the URL
      updatedEmployeeData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 200) {
      return { success: true, message: "Employee updated successfully" };
    } else {
      return { success: false, message: "Failed to update employee" };
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    return { success: false, message: "Error updating employee" };
  }
};
