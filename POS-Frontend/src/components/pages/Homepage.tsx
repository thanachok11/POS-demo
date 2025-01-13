import React from 'react';
import styles from '../../styles/Homepage.module.css';

const Homepage: React.FC = () => {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <ul>
          <li><a href="/dashboard">แดชบอร์ด</a></li>
          <li><a href="/products">สินค้า</a></li>
          <li><a href="/categories">หมวดหมู่</a></li>
          <li><a href="/inventory">คลังสินค้า</a></li>
          <li><a href="/reports">รายงาน</a></li>
          <li><a href="/settings">การตั้งค่า</a></li>
        </ul>
      </aside>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>ระบบจัดการสินค้า</h1>
        </header>
        <main className={styles.main}>
          <section className={styles.welcomeSection}>
            <h2>ยินดีต้อนรับสู่ระบบจัดการสินค้า</h2>
            <p>จัดการสินค้าได้อย่างง่ายดายและมีประสิทธิภาพ</p>
            <a href="/products" className={styles.ctaButton}>เริ่มต้นจัดการสินค้า</a>
          </section>
        </main>
        <footer className={styles.footer}>
          <p>&copy; 2025 ระบบจัดการสินค้า. สงวนลิขสิทธิ์.</p>
        </footer>
      </div>
    </div>
  );
};

export default Homepage;
