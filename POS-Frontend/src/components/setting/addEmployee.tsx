import React, { useState } from 'react';
import axios from 'axios';

const AddEmployee = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, sethPoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [message, setMessage] = useState('');

  // ฟังก์ชันที่ใช้ส่งข้อมูลไปยัง backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get the token from local storage or state (ที่คุณเก็บไว้หลังจาก login)
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage('No token found. Please log in first.');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/employee/register', // URL ของ backend API
        {
          email,
          name,
          phoneNumber,
          password,
          username,
          firstName,
          lastName,
          position,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ส่ง token ใน header
          },
        }
      );

      // ถ้าข้อมูลส่งสำเร็จ
      if (response.status === 201) {
        setMessage('Employee added successfully');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setMessage('Failed to add employee');
    }
  };

  return (
    <div>
      <h2>Add Employee</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
                <div>
          <label>PhoneNumber:</label>
          <input
            type="phoneNumber"
            value={phoneNumber}
            onChange={(e) => sethPoneNumber(e.target.value)}
            required
          />
        </div>
                <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Position:</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Employee</button>
      </form>
    </div>
  );
};

export default AddEmployee;
