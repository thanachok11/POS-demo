{userEmail && (
          <div className="logoutSection">
            <button onClick={handleLogout} className="logoutButton">
              <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> <span>ออกจากระบบ</span>
            </button>
          </div>
        )}