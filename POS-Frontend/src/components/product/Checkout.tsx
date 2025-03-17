import React, { useState } from "react";
import "../../styles/product/Checkout.css"; // CSS สำหรับ Modal
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes, faCartShopping, faMoneyBill, faQrcode, faCreditCard, faCheckCircle

} from "@fortawesome/free-solid-svg-icons";


interface CheckoutProps {
  cart: { barcode: string; name: string; price: number; quantity: number }[];
  totalPrice: number;
  onClose: () => void;
  onConfirmPayment: (method: string, amountReceived?: number) => void; // ✅ เพิ่ม amountReceived
  checkout: (amountReceived: number) => Promise<void>; // ✅ checkout รับ amountReceived
}


const Checkout: React.FC<CheckoutProps> = ({ cart, totalPrice, onClose, onConfirmPayment, checkout }) => {
  const [showNumpad, setShowNumpad] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [change, setChange] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [showQR, setShowQR] = useState(false); // เปิด QR Code
  const [showCredit, setShowCredit] = useState(false); // เปิด Modal บัตรเครดิต
  const [selectedCard, setSelectedCard] = useState<string | null>(null); // เลือกประเภทบัตร
  const navigate = useNavigate();

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
    const cashAmount = parseFloat(cashInput);
    if (change !== null && change >= 0) {
      await checkout(cashAmount);
      onConfirmPayment("cash", cashAmount);
      setPopupVisible(true);
    }
  };

  const confirmQRPayment = async () => {
    await checkout(totalPrice);
    onConfirmPayment("qr");
    setPopupVisible(true);
  };

  const confirmCreditPayment = async () => {
    if (selectedCard) {
      await checkout(totalPrice);
      onConfirmPayment(`credit-${selectedCard}`);
      setPopupVisible(true);
    }
  };
  const handleClose = () => {
    navigate("/reports/receipts");
    onClose();
  };
  return (
    <div className="checkout-modal">
      <div className="checkout-content">

        {/* ด้านซ้าย: รายการสินค้า */}
        <div className="checkout-left">
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
          {change !== null && change >= 0 && (
            <p className="checkout-change">จำนวนเงินถูกต้อง</p>
          )}
        </div>

        {/* ด้านขวา: ปุ่มเลือกวิธีชำระเงิน */}
        <div className="checkout-right">
          <button onClick={onClose} className="checkout-close-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div className="checkout-payment-buttons">
            <button className="checkout-cash-btn" onClick={() => { setShowNumpad(true); setShowQR(false); setShowCredit(false); }}>
              <FontAwesomeIcon icon={faMoneyBill} /> เงินสด
            </button>
            <button className="checkout-qr-btn" onClick={() => { setShowQR(true); setShowNumpad(false); setShowCredit(false); }}>
              <FontAwesomeIcon icon={faQrcode} /> QR Code
            </button>
            <button className="checkout-credit-btn" onClick={() => { setShowCredit(true); setShowNumpad(false); setShowQR(false); }}>
              <FontAwesomeIcon icon={faCreditCard} /> บัตรเครดิต
            </button>
          </div>

          {!showNumpad ? !showQR && !showCredit && (
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
                <button className="numpad-btn clear-btn" onClick={() => setCashInput("")}>
                  C
                </button>
                <button className="numpad-btn confirm-btn" onClick={handleCashPayment}>
                  ยืนยัน
                </button>
              </div>
              <button onClick={confirmCashPayment} className="checkout-btn checkout-confirm-btn" disabled={change === null || change < 0}>
                ยืนยันชำระเงิน
              </button>
            </div>
          )}

          {/* QR Code Modal */}
          {showQR && (
            <div className="qr-modal">
              <h3 className="qr-title">สแกน QR Code เพื่อชำระเงิน</h3>
              <img
                src="https://res.cloudinary.com/dboau6axv/image/upload/v1742099090/Qr_POS_oioty6.jpg"
                alt="QR Code"
                className="qr-code-image"
              />
              <button onClick={confirmQRPayment} className="qr-confirm-btn">
                ยืนยันชำระเงิน
              </button>
            </div>
          )}


          {/* Credit Card Modal */}
          {showCredit && (
            <div className="credit-modal">
              <h3 className="credit-title">เลือกประเภทบัตรเครดิต</h3>
              <div className="credit-options">
                {["Visa", "Mastercard", "JCB"].map((card) => (
                  <button
                    key={card}
                    className={`credit-option ${selectedCard === card ? "selected" : ""}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    {card}
                  </button>
                ))}
              </div>
              <button onClick={confirmCreditPayment} className="credit-confirm-btn" disabled={!selectedCard}>
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
}


export default Checkout;
