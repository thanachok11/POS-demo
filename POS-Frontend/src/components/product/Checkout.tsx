import React, { useState } from "react";
import "../../styles/product/Checkout.css"; // CSS สำหรับ Modal
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes, faCartShopping, faMoneyBill, faQrcode, faCreditCard, faCheckCircle

} from "@fortawesome/free-solid-svg-icons";


interface CheckoutProps {
  cart: { barcode: string; name: string; price: number; quantity: number }[];
  totalPrice: number;
  onClose: () => void;
  onConfirmPayment: (method: string) => void;
  checkout: () => Promise<void>;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, totalPrice, onClose, onConfirmPayment, checkout }) => {
  const [showNumpad, setShowNumpad] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [change, setChange] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false); // Show popup after payment

  const handleCashPayment = () => {
    const cashAmount = parseFloat(cashInput);
    if (isNaN(cashAmount) || cashAmount < totalPrice) {
      setError("จำนวนเงินไม่เพียงพอ");
      setChange(null);
    } else {
      setChange(cashAmount - totalPrice);
      setError(null);
    }
  };

  const confirmCashPayment = async () => {
    if (change !== null && change >= 0) {
      await checkout(); // call checkout function
      setPopupVisible(true); // Show the success popup
    }
  };

  return (
    <div className="checkout-modal">
      <div className="checkout-content">
        <div className="checkout-left">
          <div className="checkout-payment-buttons">
            <button className="checkout-cash-btn" onClick={() => setShowNumpad(true)}>
              <FontAwesomeIcon icon={faMoneyBill} /> เงินสด
            </button>
            <button className="checkout-qr-btn" onClick={() => onConfirmPayment("qr")}>
              <FontAwesomeIcon icon={faQrcode} /> QR Code
            </button>
            <button className="checkout-credit-btn" onClick={() => onConfirmPayment("credit")}>
              <FontAwesomeIcon icon={faCreditCard} /> บัตรเครดิต
            </button>
          </div>
          <div className="checkout-items">
            {cart.map((item) => (
              <div key={item.barcode} className="checkout-item">
                <span className="checkout-item-name">{item.name}</span> 
                <span className="checkout-item-price">ราคา {item.price} บาท</span> 
                <span className="checkout-item-quantity">x {item.quantity} รายการ</span>
              </div>
            ))}
          </div>

          <div className="checkout-total">
            <span className="checkout-total-label">ยอดรวม:</span> 
            <span className="checkout-total-price">{totalPrice} ฿</span>
          </div>

          {error && <p className="checkout-error">{error}</p>}

          {change !== null && change >= 0 && (
            <p className="checkout-change">จำนวนเงินถูกต้อง</p>
          )}
        </div>
        <div className="checkout-right">
          <button onClick={onClose} className="checkout-close-btn"><FontAwesomeIcon icon={faTimes} /></button>

          {!showNumpad ? (
            <div>
              <h2 className="checkout-title">
                <FontAwesomeIcon icon={faCartShopping} /> เลือกวิธีชำระเงิน
              </h2>
              {error && <div className="checkout-error">{error}</div>}
            </div>
          ) : (
            <div className="checkout-numpad">
              <h3 className="checkout-numpad-title">กรุณาใส่จำนวนเงิน</h3>
              <input type="text" className="checkout-numpad-input" value={cashInput} readOnly />
              <div className="numpad-buttons">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button key={num} className="numpad-btn" onClick={() => setCashInput(cashInput + num)}>
                    {num}
                  </button>
                ))}
                <button className="numpad-btn clear-btn" onClick={() => setCashInput("")}>C</button>
                <button className="numpad-btn confirm-btn" onClick={handleCashPayment}>ยืนยัน</button>

              </div>
              <button onClick={confirmCashPayment} className="checkout-btn checkout-confirm-btn" disabled={change === null || change < 0}>
                ยืนยันชำระเงิน
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Popup for successful payment */}
      {popupVisible && (
        <div className="payment-popup">
          <div className="payment-popup-content">
            {/* ไอคอนติ๊กถูกพร้อมแอนิเมชัน */}
            <FontAwesomeIcon icon={faCheckCircle} className="payment-popup-icon" />

            <h3 className="payment-popup-title">ชำระเงินสำเร็จ!</h3>
            <p className="payment-popup-change">เงินทอน: {change} ฿</p>

            <button onClick={onClose} className="payment-popup-close-btn">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
