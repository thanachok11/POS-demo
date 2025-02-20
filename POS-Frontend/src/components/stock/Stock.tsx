import React, { useState, useEffect } from 'react';

const StockPage = () => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect ดึงข้อมูล stock เมื่อ component โหลด
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token'); // ดึง token จาก localStorage

      if (!token) {
        setError('No token found');
        setLoading(false);
        return;
      }

      try {
        // เรียก API เพื่อดึงข้อมูล stock โดยส่ง token ใน header
        const response = await fetch('http://localhost:5000/api/stocks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // ส่ง token ไปใน header
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching stock data');
        }

        const data = await response.json();
        setStockData(data.data); // กำหนดข้อมูล stock ที่ดึงได้
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // useEffect จะทำงานครั้งเดียวเมื่อ component โหลด

  // แสดงสถานะ loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // แสดงข้อผิดพลาด
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Stock List</h1>
      {/* แสดง stock ที่ดึงมา */}
      {stockData.length > 0 ? (
        <ul>
          {stockData.map((stock, index) => (
            <li key={index}>
              <strong>{stock.name}</strong> - Quantity: {stock.quantity}
            </li>
          ))}
        </ul>
      ) : (
        <p>No stock data available</p>
      )}
    </div>
  );
};

export default StockPage;
