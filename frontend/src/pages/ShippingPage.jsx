import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ShippingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousAddress = location.state?.previousAddress;
  const userEmail = location.state?.userEmail || "";

  const [address, setAddress] = useState({
    fullName: "",
    email: userEmail,
    address: "",
    Contact: "",
    city: "",
    pincode: "",
    state: "",
  });

  useEffect(() => {
    const storedAddress = localStorage.getItem("shippingAddress");
    const parsedAddress = previousAddress || (storedAddress ? JSON.parse(storedAddress) : null);

    if (parsedAddress) {
      setAddress({
        fullName: parsedAddress.fullName || "",
        email: parsedAddress.email || userEmail,
        address: parsedAddress.address || "",
        Contact: parsedAddress.Contact || "",
        city: parsedAddress.city || "",
        pincode: parsedAddress.pincode || "",
        state: parsedAddress.state || "",
      });
    } else if (userEmail) {
      setAddress((current) => ({ ...current, email: userEmail }));
    }
  }, [previousAddress, userEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("shippingAddress", JSON.stringify(address));
    navigate(-1);
  };

  return (
    <div className="container page">
      <h2 className="page-title">📦 Shipping Address</h2>

      <form className="shipping-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={address.fullName}
          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
          required
        />

        <input type="email" value={address.email} readOnly />

        <input
          type="text"
          placeholder="Phone Number"
          value={address.Contact}
          onChange={(e) => setAddress({ ...address, Contact: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Full Address"
          value={address.address}
          onChange={(e) => setAddress({ ...address, address: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="City"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Pincode"
          value={address.pincode}
          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="State"
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value })}
          required
        />

        <button type="submit" className="button">
          Continue to Checkout 🚀
        </button>
      </form>
    </div>
  );
};

export default ShippingPage;
