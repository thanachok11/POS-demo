import React, { useState, useEffect } from "react";

import "../../styles/payment/Checkout.css"; // CSS สำหรับ Modal
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes, faCartShopping, faMoneyBill, faQrcode, faCreditCard, faCheckCircle

} from "@fortawesome/free-solid-svg-icons";

import { QRCodeSVG } from 'qrcode.react'; // 👈 แก้ตรงนี้
import generatePayload from 'promptpay-qr';

interface CheckoutProps {
  cart: { barcode: string; name: string; price: number; quantity: number }[];
  totalPrice: number;
  onClose: () => void;
  onConfirmPayment: (method: string, amountReceived?: number) => void; // ✅ เพิ่ม amountReceived
  checkout: (
    amountReceived: number,
    selectedPaymentMethod: "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code"
  ) => Promise<void>
}


const Checkout: React.FC<CheckoutProps> = ({ cart, totalPrice, onClose, onConfirmPayment, checkout }) => {
  const [showNumpad, setShowNumpad] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [change, setChange] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [showCredit, setShowCredit] = useState(false); // เปิด Modal บัตรเครดิต
  const [selectedCard, setSelectedCard] = useState<string | null>(null); // เลือกประเภทบัตร
  const navigate = useNavigate();

  const [totalPriceQr, setTotalPrice] = useState(0);

  const [phoneNumber] = useState("0633133099");
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setqrCode] = useState("");

  const handleCashPayment = () => {
    const cashAmount = parseFloat(cashInput);
    if (isNaN(cashAmount)) {
      setError("กรุณาใส่จำนวนเงินให้ถูกต้อง");
      setChange(null);
    } else {
      setChange(cashAmount - totalPrice); // ✅ ตั้งค่า change ทุกกรณี
      setError(null); // ❌ ไม่ต้องตั้ง error ที่นี่ ใช้ JSX เช็คแทน
    }
  };


  const confirmCashPayment = async () => {
    const cashAmount = parseFloat(cashInput);
    if (change !== null && change >= 0) {
      console.log("📦 เรียก checkout แล้ว:", cashAmount); // ✅ Log ตรงนี้

      await checkout(cashAmount, "เงินสด"); // ✅ เรียกตรงนี้เลย
      setPopupVisible(true);
    }
  };



  const confirmQRPayment = async () => {
    await checkout(totalPrice, "QR Code"); // ✅ ส่งราคาเข้าไปเป็นเงินที่รับ
    setPopupVisible(true);
  };

  const confirmCreditPayment = async () => {
    if (selectedCard) {
      await checkout(totalPrice, "บัตรเครดิต"); // ✅ ส่งราคาเข้าไปเป็นเงินที่รับ
      setPopupVisible(true);
    }
  };




    useEffect(() => {
      const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotalPrice(total);
    }, [cart]);

    useEffect(() => {
      // Generate PromptPay QR code when totalPrice changes
      const qr = generatePayload(phoneNumber, { amount: totalPrice });
      setqrCode(qr);
    }, [totalPrice, phoneNumber]);
  
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
                <span className="checkout-item-price">ราคา {item.price.toLocaleString()} บาท</span>
                <span className="checkout-item-quantity">x {item.quantity} รายการ</span>
              </div>
            ))}
          </div>

          <div className="checkout-total">
            <span className="checkout-total-label">ยอดรวม:</span>
            <span className="checkout-total-price">{totalPrice.toLocaleString()} ฿</span>
          </div>

          {/* แสดงข้อความเมื่อจำนวนเงินเพียงพอ */}
          {change !== null && change >= 0 && (
            <p className="checkout-change">จำนวนเงินถูกต้อง</p>
          )}

          {/* แสดงข้อความเมื่อจำนวนเงินไม่พอ */}
          {change !== null && change < 0 && (
            <p className="checkout-error">จำนวนเงินไม่เพียงพอ</p>
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
                <input
                  type="text"
                  className="checkout-numpad-input"
                  value={
                    Number(cashInput)
                      ? Number(cashInput).toLocaleString(): ""
                  }
                  readOnly
                />

                <div className="numpad-buttons">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                    <button
                      key={num}
                      className="numpad-btn"
                      onClick={() => {
                        setCashInput(cashInput + num);
                        setError(null); // เคลียร์ error ถ้ามี
                      }}
                    >
                      {num}
                    </button>
                  ))}

                  {/* ปุ่มลบทีละตัว (Backspace) */}
                  <button
                    className="numpad-btn backspace-btn"
                    onClick={() => {
                      setCashInput(cashInput.slice(0, -1));
                      setChange(null);
                      setError(null);
                    }}
                  >
                    ⬅
                  </button>

                  {/* ปุ่มล้างทั้งหมด */}
                  <button
                    className="numpad-btn clear-btn"
                    onClick={() => {
                      setCashInput("");
                      setChange(null);
                      setError(null);
                    }}
                  >
                    AC
                  </button>

                  {/* ปุ่มคำนวณเงินทอน */}
                  <button className="numpad-btn confirm-btn" onClick={handleCashPayment}>
                    ยืนยัน
                  </button>
                </div>

                <button
                  onClick={confirmCashPayment}
                  className="checkout-btn checkout-confirm-btn"
                  disabled={change === null || change < 0}
                >
                  ยืนยันชำระเงิน
                </button>
              </div>

          )}

          {/* QR Code Modal */}
          {showQR && (
            <div className="qr-code-image">
              <h3 className="qr-title">สแกน QR Code เพื่อชำระเงิน</h3>
              {qrCode && <QRCodeSVG value={qrCode} size={256} />}
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
      {popupVisible && (
        <div className="payment-popup">
          <div className="payment-popup-content">
            <FontAwesomeIcon icon={faCheckCircle} className="payment-popup-icon" />
            <h3 className="payment-popup-title">ชำระเงินสำเร็จ!</h3>
            <p className="payment-popup-change">เงินทอน: {change?.toLocaleString()} ฿</p>

            <button
              onClick={() => {
                setPopupVisible(false);  // ✅ ซ่อน popup
                onClose();               // ✅ ปิด Modal หลังจาก popup หายไป
              }}
              className="payment-popup-close-btn"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>

  );
}


export default Checkout;
