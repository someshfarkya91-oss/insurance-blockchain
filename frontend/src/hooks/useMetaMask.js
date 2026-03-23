import { useState } from "react";
import api from "../api";

export default function useMetaMask({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);

  const connect = async () => {
    if (!window.ethereum) {
      onError("MetaMask not installed. Please install it to continue.");
      return;
    }
    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      setAddress(walletAddress);

      const res = await api.post("/auth/metamask", { walletAddress });
      const { token, role, username } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "user");

      onSuccess({ token, role, username, walletAddress });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "MetaMask login failed";
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return { connect, loading, address };
}